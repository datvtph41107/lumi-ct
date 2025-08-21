## @secure/authz-express

Express middlewares to enforce `@secure/authz-core` decisions:

- `requireAuth` ensures `req.user` is present
- `enforce(builder)` builds a `RequestContext` and denies with 403 when not allowed

