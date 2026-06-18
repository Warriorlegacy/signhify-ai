# Security Policy

## Reporting a Vulnerability

The Signhify AI team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the project creator:

- **Email**: Through LinkedIn or Instagram DMs
- **LinkedIn**: [piyushraj-singh](https://linkedin.com/in/piyushraj-singh)
- **Instagram**: [@piyushrajsingh.golu](https://www.instagram.com/piyushrajsingh.golu)

You should receive a response within 48 hours. If for some reason you do not, please follow up to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the vulnerability
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

| Stage              | Timeline              |
| ------------------ | --------------------- |
| Acknowledgment     | Within 48 hours       |
| Initial Assessment | Within 1 week         |
| Fix Development    | Within 2 weeks        |
| Public Disclosure  | After fix is deployed |

## Supported Versions

| Version       | Supported |
| ------------- | --------- |
| 3.x (current) | ✅        |
| 2.x           | ❌        |
| 1.x           | ❌        |

## Security Measures

Signhify AI implements the following security measures:

- **Authentication**: JWT with short-lived access tokens (15 min) and httpOnly refresh cookies (30 days)
- **Rate Limiting**: Redis-backed rate limiting with in-memory fallback (100 req/min for API, 10 req/min for auth)
- **Input Validation**: Zod schema validation on all API inputs
- **CORS**: Configurable origin with credentials support
- **Helmet**: Security headers including Content Security Policy
- **BYOK Architecture**: User API keys are transmitted over HTTPS and never stored server-side
- **Environment Validation**: Server fails fast on missing critical environment variables
- **Graceful Degradation**: Redis cache unavailability doesn't crash the server

## Known Limitations

- **Client-side key storage**: BYOK API keys are stored in browser localStorage with encryption. While protected by same-origin policy, XSS vulnerabilities could expose them.
- **In-memory rate limiting**: When Redis is unavailable, rate limits are per-instance only (not distributed).

## Best Practices for Deployment

### Production Checklist

- [ ] Rotate all API keys and secrets
- [ ] Enable HTTPS (TLS 1.3)
- [ ] Configure proper CORS origins
- [ ] Set secure HTTP headers
- [ ] Enable rate limiting
- [ ] Configure MongoDB authentication
- [ ] Set up Redis authentication
- [ ] Enable audit logging
- [ ] Configure backup strategy
- [ ] Set up monitoring and alerting

### Environment Configuration

For production deployments, ensure these environment variables are properly configured:

```bash
# JWT secrets (minimum 32 characters each)
JWT_SECRET=<cryptographically-random-string>
JWT_REFRESH_SECRET=<cryptographically-random-string>

# MongoDB connection string
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/signhify

# CORS origin (your production domain)
CORS_ORIGIN=https://your-domain.com

# Redis URL (optional but recommended)
REDIS_URL=redis://<host>:<port>
```

### MongoDB Atlas Security

1. Enable IP whitelist (restrict to known IPs)
2. Enable database authentication
3. Use strong passwords
4. Enable encryption at rest
5. Enable encryption in transit
6. Regular backups

### Redis Security

1. Set a strong password
2. Disable dangerous commands
3. Enable TLS if possible
4. Restrict network access

## Dependencies

We regularly update dependencies to patch known vulnerabilities:

```bash
# Check for vulnerable dependencies
pnpm audit

# Update dependencies
pnpm update

# Fix vulnerable dependencies
pnpm audit fix
```

## Security Contacts

- **Project Creator**: Piyush Raj Singh
- **LinkedIn**: [linkedin.com/in/piyushraj-singh](https://linkedin.com/in/piyushraj-singh)
- **Instagram**: [@piyushrajsingh.golu](https://www.instagram.com/piyushrajsingh.golu)

---

## Acknowledgments

We would like to thank:

- Security researchers who responsibly disclose vulnerabilities
- The open-source community for security tools and best practices
- Contributors who help improve the security of this project

---

_Last updated: June 18, 2026_
