# JMAP Mail

markweb integrates with Stalwart mail server via the JMAP protocol, providing a full webmail experience.

## Stalwart Server

Stalwart runs on port 8443 (TLS) as the `stalwart` user. The JMAP session endpoint is proxied through Caddy:

```
https://mail.kanary.org/.well-known/jmap
```

### Principal Configuration

Stalwart uses full email addresses as principal names (e.g., `markc@kanary.org`) — required for virtual domain support. Principals need these permissions for sending:

- `jmap-identity-get`
- `jmap-identity-set`

### Account IDs

Stalwart uses short IDs (e.g., `"d"`) internally — never use `accountId` as an email address. The actual email comes from `session['username']`.

## jmap-jam Client

`lib/jmap-client.ts` creates a `JamClient` instance with:

- Basic auth credentials
- URL rewriting (Stalwart internal URLs to app reverse proxy)

### Known Gotcha: requestMany

`jmap-jam`'s `requestMany` does **not** support JMAP creation ID back-references (`#draft`) between method calls. This causes `invalidResultReference` errors.

**Fix:** Split multi-step operations into separate API calls. For example, `sendEmail`:

1. `Email/set` — create the email (get real ID)
2. `EmailSubmission/set` — submit with the actual ID

Never combine these in a single `requestMany` call.

## Frontend Stores

Zustand stores in `stores/mail/` manage all mail state:

| Store | Purpose |
|-------|---------|
| `session-store` | JMAP auth, session init |
| `mailbox-store` | Folder list, counts |
| `email-store` | Message list, fetch, cache |
| `compose-store` | Draft composition |
| `ui-store` | Selection, view state |

## Key Fixes

### fetchEmails TDZ Bug

Original code used `results?.query.$ref('/ids')` which referenced a const before initialization. Fixed to use the builder pattern: `query.$ref('/ids')`.

### EmailSubmission Requires identityId

Stalwart requires `identityId` on `EmailSubmission/set`. Added `fetchIdentityId()` to jmap-client.ts to fetch the identity before submission.

### Email/set Requires mailboxIds

Stalwart rejects `Email/set` create with empty `{}` mailboxIds. The compose flow now requires a `draftsMailboxId` when creating emails.

### From Header Used accountId

`session.accountId` returns `"d"` (not an email). Fixed by adding an `email` field sourced from `session['username']`.

### displayName Was Email

JMAP session returns email as account name. Fixed by fetching real name from `Identity/get` during authentication.
