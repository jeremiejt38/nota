# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| Latest stable release | Yes |
| Older releases | No, unless stated otherwise |

## Reporting a vulnerability

Do not report vulnerabilities through public issues. Use GitHub Private Vulnerability Reporting when enabled, or contact the repository owner directly. Include the affected version, reproduction steps, impact and any mitigation you identified.

## Security rules

- Never commit secrets, access tokens or private keys.
- Never include personally identifiable production data or proprietary information.
- Keep dependencies and base images updated.

## Scope

Nota stores notes in plain text on the local filesystem. In-scope concerns are local data exposure, malicious note content rendering, and supply-chain issues in the build/TypeScript toolchain.
