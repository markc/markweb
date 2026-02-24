# CalDAV / CardDAV

markweb provides calendar and contacts synchronization via SabreDAV.

## SabreDAV Backends

Custom backends in `app/Dav/`:

| Backend | Purpose |
|---------|---------|
| `AuthBackend` | Authentication against Laravel users |
| `CalendarBackend` | Calendar storage and retrieval |
| `CardDavBackend` | Contact/address book operations |
| `PrincipalBackend` | User principal management |

## Well-Known Redirects

Standard discovery URLs are configured:

```
/.well-known/caldav   → /dav/
/.well-known/carddav  → /dav/
```

This allows calendar and contacts clients (Apple Calendar, Thunderbird, DAVx5) to auto-discover the DAV endpoint.

## Client Configuration

Point your CalDAV/CardDAV client to:

```
https://markweb.kanary.org/dav/
```

Use your markweb account credentials to authenticate.

## Data Model

Calendars and contacts are stored in PostgreSQL, associated with Laravel user accounts. The SabreDAV backends translate between DAV protocol operations and Eloquent models.
