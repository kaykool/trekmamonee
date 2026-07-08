---
name: cpanel-security-audit
description: Run a comprehensive security audit for SvelteKit, Node.js, and MySQL applications specifically tailored for cPanel hosting environments. Make sure to use this skill whenever the user mentions "audit security", "is my app secure", "check deployment readiness", "prepare for production", or "cpanel security", even if they don't explicitly ask for an "audit".
---

# cPanel Node.js Security Audit

This skill guides you through auditing a full-stack Node.js application (like SvelteKit) destined for a cPanel environment. cPanel has specific hosting paradigms (like `public_html` mappings, `.htaccess` usage, and shared database servers) that require unique security considerations.

## Audit Workflow

When invoked, perform the following checks sequentially. Do not just list them—actively analyze the user's workspace for these vulnerabilities and present a structured report.

### 1. Environment & Secrets Management
- **Check `.env` location**: Ensure `.env` files and sensitive configs (`drizzle.config.ts`, `vite.config.ts`) are completely outside the web root (usually outside `public_html` in cPanel).
- **Check `.gitignore`**: Ensure `.env` is ignored.

### 2. Backend & Database (MySQL / Drizzle)
- **SQL Injection**: Audit database queries to ensure ORM methods (like Drizzle) are used safely and raw string interpolation is avoided.
- **Connection Security**: Ensure database connections do not hardcode passwords. 

### 3. Frontend & API Security (SvelteKit)
- **CSRF & XSS**: Check if SvelteKit form actions validate inputs and sanitize user-generated content before rendering. Ensure Svelte's `{@html ...}` tag is not used with unsanitized data.
- **API Protection**: Verify that sensitive `+server.ts` routes or form actions check for authentication/authorization.

### 4. Deployment Safety
- **cPanel Node App Setup**: Verify that the SvelteKit Node adapter is used and that the `package.json` does not expose malicious post-install scripts.
- **Dependency Audit**: Run `rtk npm audit` to check for baseline package vulnerabilities.

## Output Format

After completing the analysis, generate an artifact named `cpanel_security_report.md` structured like this:

```markdown
# 🛡️ cPanel Security Audit Report

## Executive Summary
[Brief summary of overall security posture]

## 🚨 Critical Vulnerabilities (Action Required)
- [List any severe issues like exposed .env files, SQLi, or XSS]

## ⚠️ Warnings & Recommendations
- [List best-practice recommendations for cPanel deployment]

## ✅ Passed Checks
- [List what the app is doing right]
```
