# Security Policy

## Supported Versions

Tone.js security fixes are provided for the latest stable release published to npm.

| Version                    | Supported   |
| -------------------------- | ----------- |
| Latest npm release         | Yes         |
| `tone@next` / `dev` branch | Best effort |
| Older releases             | No          |

Users should update to the latest available version before reporting an issue that may already have been fixed.

## Reporting a Vulnerability

Please do **not** report security vulnerabilities through public GitHub issues, discussions, or pull requests.

If you believe you have found a security vulnerability in Tone.js, please report it privately using GitHub’s **Private Vulnerability Reporting** feature for this repository, if available.

If private reporting is not enabled, please open a minimal public issue asking for a private maintainer contact, without including exploit details.

Please include:

* Tone.js version
* Installation method, such as npm, CDN, bundled build, or `tone@next`
* Browser and operating system
* Minimal reproduction or proof of concept
* Whether the issue affects browser runtime behavior, package installation, build tooling, published artifacts, or documentation examples
* Any required user interaction, permissions, or special configuration
* Impact assessment, if known

## Scope

Security issues may include, but are not limited to:

* Vulnerabilities in published npm or CDN-distributed Tone.js artifacts
* Supply-chain issues affecting build, release, or package integrity
* Prototype pollution, code execution, or unsafe evaluation paths
* Unsafe handling of URLs, buffers, user-controlled values, or external audio assets
* Denial-of-service issues that can significantly degrade or crash pages using Tone.js
* Cross-origin, browser API, or Web Audio behavior that creates a practical security impact
* Security-impacting vulnerabilities in runtime dependencies

The following are usually **not** security vulnerabilities unless they create a clear security impact:

* Audio glitches, timing drift, browser compatibility bugs, or performance regressions
* General API bugs
* Documentation errors
* Feature requests
* Issues caused only by unsafe application code outside Tone.js
* Vulnerabilities limited to development-only tooling that cannot affect users of the published package

## Coordinated Disclosure

Please give the maintainers reasonable time to investigate and fix confirmed vulnerabilities before public disclosure.

Researchers are asked to:

* Act in good faith
* Avoid harming users or services
* Avoid accessing data that does not belong to you
* Keep vulnerability details private until a fix or mitigation is available
* Provide enough information to reproduce and verify the issue

## Response Expectations

The project will make a best effort to:

* Acknowledge valid vulnerability reports
* Investigate and reproduce the issue
* Request additional information when needed
* Release a fix or mitigation when appropriate
* Publish a GitHub Security Advisory when appropriate
* Credit the reporter if requested

This project does not currently offer a paid bug bounty program.

## Security Updates

Security fixes are released through the normal Tone.js release process and published to npm.

Users should install the latest version:

```bash
npm install tone@latest
```

Projects using CDN builds should pin to a fixed, updated version instead of relying on an unpinned URL.
