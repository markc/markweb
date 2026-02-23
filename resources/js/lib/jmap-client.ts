import { JamClient } from 'jmap-jam';
import type { EmailAddress, EmailBodyPart, EmailFull, EmailListItem, JmapSession, MailboxNode } from '@/types/mail';

export function createJamClient(session: JmapSession): JamClient {
    const basicAuth = `Basic ${session.token!}`;
    const sessionUrl = session.apiUrl!.replace(/\/jmap\/$/, '/jmap/session');
    const appOrigin = window.location.origin;

    // Rewrite Stalwart's internal URLs to use the app's reverse proxy
    const rewriteUrls = (data: Record<string, unknown>) => {
        for (const key of ['apiUrl', 'downloadUrl', 'uploadUrl', 'eventSourceUrl']) {
            if (typeof data[key] === 'string') {
                data[key] = (data[key] as string).replace(/https?:\/\/[^/]+(?::\d+)?/, appOrigin);
            }
        }
        return data;
    };

    // Patch loadSession to use Basic auth and rewrite URLs from Stalwart response
    const origLoadSession = JamClient.loadSession;
    JamClient.loadSession = (url: string, _authHeader: string) =>
        origLoadSession(url, basicAuth).then(rewriteUrls) as ReturnType<typeof origLoadSession>;

    const client = new JamClient({
        bearerToken: session.token!,
        sessionUrl,
    });
    client.authHeader = basicAuth;

    JamClient.loadSession = origLoadSession;

    return client;
}

const LIST_PROPERTIES = [
    'id', 'threadId', 'mailboxIds', 'keywords', 'from', 'to',
    'subject', 'receivedAt', 'preview', 'size', 'hasAttachment',
] as const;

const FULL_PROPERTIES = [
    ...LIST_PROPERTIES,
    'cc', 'bcc', 'replyTo', 'sentAt', 'bodyValues',
    'htmlBody', 'textBody', 'attachments',
] as const;

export async function fetchMailboxes(client: JamClient, accountId: string): Promise<MailboxNode[]> {
    const [data] = await client.api.Mailbox.get({
        accountId,
        ids: null,
    });

    return (data.list as unknown as MailboxNode[]).map((m) => ({
        ...m,
        children: [],
    }));
}

export function buildMailboxTree(mailboxes: MailboxNode[]): MailboxNode[] {
    const map = new Map<string, MailboxNode>();
    const roots: MailboxNode[] = [];

    for (const mb of mailboxes) {
        map.set(mb.id, { ...mb, children: [] });
    }

    for (const mb of map.values()) {
        if (mb.parentId && map.has(mb.parentId)) {
            map.get(mb.parentId)!.children.push(mb);
        } else {
            roots.push(mb);
        }
    }

    const sortFn = (a: MailboxNode, b: MailboxNode) => a.sortOrder - b.sortOrder;
    const sortTree = (nodes: MailboxNode[]) => {
        nodes.sort(sortFn);
        for (const n of nodes) {
            sortTree(n.children);
        }
    };
    sortTree(roots);

    return roots;
}

export async function fetchEmails(
    client: JamClient,
    accountId: string,
    mailboxId: string,
    opts: { position?: number; limit?: number; sort?: string } = {},
): Promise<{ emails: EmailListItem[]; total: number; position: number }> {
    const { position = 0, limit = 50, sort = 'receivedAt' } = opts;

    const [results] = await client.requestMany((b) => {
        const query = b.Email.query({
            accountId,
            filter: { inMailbox: mailboxId },
            sort: [{ property: sort, isAscending: false }],
            position,
            limit,
        });
        return {
            query,
            get: b.Email.get({
                accountId,
                ids: query.$ref('/ids'),
                properties: [...LIST_PROPERTIES],
            } as any),
        };
    });

    return {
        emails: (results.get as any).list as EmailListItem[],
        total: (results.query as any).total ?? 0,
        position: (results.query as any).position ?? 0,
    };
}

export async function fetchEmailBody(
    client: JamClient,
    accountId: string,
    emailId: string,
): Promise<EmailFull | null> {
    const [data] = await client.api.Email.get({
        accountId,
        ids: [emailId],
        properties: [...FULL_PROPERTIES],
        fetchHTMLBodyValues: true,
        fetchTextBodyValues: true,
        maxBodyValueBytes: 1024 * 1024,
    });

    const list = data.list as unknown as EmailFull[];
    return list[0] ?? null;
}

export async function setEmailKeywords(
    client: JamClient,
    accountId: string,
    emailId: string,
    keywords: Record<string, boolean | null>,
): Promise<void> {
    const patch: Record<string, boolean | null> = {};
    for (const [key, value] of Object.entries(keywords)) {
        patch[`keywords/${key}`] = value;
    }

    await client.api.Email.set({
        accountId,
        update: { [emailId]: patch },
    } as any);
}

export async function moveEmail(
    client: JamClient,
    accountId: string,
    emailId: string,
    fromMailboxId: string,
    toMailboxId: string,
): Promise<void> {
    await client.api.Email.set({
        accountId,
        update: {
            [emailId]: {
                [`mailboxIds/${fromMailboxId}`]: null,
                [`mailboxIds/${toMailboxId}`]: true,
            },
        },
    } as any);
}

export async function deleteEmail(
    client: JamClient,
    accountId: string,
    emailId: string,
): Promise<void> {
    await client.api.Email.set({
        accountId,
        destroy: [emailId],
    } as any);
}

export async function fetchIdentityId(
    client: JamClient,
    accountId: string,
): Promise<string> {
    const [data] = await client.api.Identity.get({
        accountId,
        ids: null,
    } as any);

    const list = (data as any).list as { id: string }[];
    if (!list?.length) {
        throw new Error('No sending identity configured — contact your mail admin');
    }
    return list[0].id;
}

export async function sendEmail(
    client: JamClient,
    accountId: string,
    email: {
        from: EmailAddress[];
        to: EmailAddress[];
        cc?: EmailAddress[];
        bcc?: EmailAddress[];
        subject: string;
        textBody: string;
        htmlBody?: string;
        inReplyTo?: string[];
        references?: string[];
        attachments?: { blobId: string; name: string; type: string; size: number }[];
        draftsMailboxId: string;
    },
): Promise<void> {
    const identityId = await fetchIdentityId(client, accountId);

    const bodyParts: EmailBodyPart[] = [];

    if (email.htmlBody) {
        bodyParts.push({ partId: 'html', type: 'text/html' } as EmailBodyPart);
    }
    bodyParts.push({ partId: 'text', type: 'text/plain' } as EmailBodyPart);

    const bodyValues: Record<string, { value: string }> = {
        text: { value: email.textBody },
    };
    if (email.htmlBody) {
        bodyValues.html = { value: email.htmlBody };
    }

    const emailCreate: Record<string, unknown> = {
        from: email.from,
        to: email.to,
        cc: email.cc?.length ? email.cc : undefined,
        bcc: email.bcc?.length ? email.bcc : undefined,
        subject: email.subject,
        textBody: [{ partId: 'text', type: 'text/plain' }],
        htmlBody: email.htmlBody ? [{ partId: 'html', type: 'text/html' }] : undefined,
        bodyValues,
        keywords: { $draft: true },
        mailboxIds: { [email.draftsMailboxId]: true },
    };

    if (email.inReplyTo) {
        emailCreate.inReplyTo = email.inReplyTo;
    }
    if (email.references) {
        emailCreate.references = email.references;
    }
    if (email.attachments?.length) {
        emailCreate.attachments = email.attachments.map((a) => ({
            blobId: a.blobId,
            name: a.name,
            type: a.type,
            size: a.size,
        }));
    }

    await client.requestMany((b) => ({
        emailSet: b.Email.set({
            accountId,
            create: { draft: emailCreate },
        } as any),
        submit: b.EmailSubmission.set({
            accountId,
            create: {
                sub: {
                    emailId: '#draft',
                    identityId,
                } as any,
            },
            onSuccessUpdateEmail: {
                '#sub': {
                    [`keywords/$draft`]: null,
                } as any,
            },
        } as any),
    }));
}

export function findMailboxByRole(mailboxes: MailboxNode[], role: string): MailboxNode | undefined {
    return mailboxes.find((m) => m.role === role);
}
