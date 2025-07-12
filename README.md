# Orel

Orel is a lightweight, configuration-driven deployment framework designed to securely and reliably deploy Node.js frontends and Java backends using a single docker-compose.yml on on-premise servers.


## Install on Server

```
curl -sSL https://raw.githubusercontent.com/royalzsoftware/orel/master/initial-setup.sh | sudo bash
```

## Core Use Cases & Features to Implement
### 1. Initial Server Setup

- Secure base configuration: Create necessary users, SSH keys, firewall rules, and basic hardening.
- Secret management: Generate and securely store secrets like passwords and SSH keys on the server.
- Remote initialization: Allow initializing a remote server from a local machine, downloading and installing DeployFW automatically.

### 2. Configuration Management

- Config loading and validation: Support YAML-based app and server configs with placeholders for secrets.
- Config synchronization: Sync config files between local and remote servers reliably.
- Multi-domain support: Manage multiple domains and subdomains with a single Nginx configuration that proxies to Docker containers.

### 3. Service Deployment & Lifecycle

- Docker-compose integration: Pull, build, and restart services without root privileges, wrapped for security.
- Single docker-compose file: Combine multiple services (frontend, backend, static sites, databases) in one file.
- Nginx config generation: Auto-generate Nginx config for routing and SSL termination with automatic Let's Encrypt support.
- Zero-downtime deployment: Restart services safely when new images or configs are deployed.

### 4. Database & Backup

- Secret handling for DB credentials: Auto-generate and securely manage DB passwords, injecting them into environment variables without exposing them in configs.
- Flyway migrations: Run database migration scripts automatically before deploying new backend versions.
- Backup management: Configure and perform backups of specified volumes or paths (e.g., DB data, logs).

### 5. CI/CD Integration

- GitHub Actions wrapper: Provide reusable GitHub Actions to build Docker images, push to registries, and deploy to servers using SSH and the DeployFW CLI.
- Non-root deployment user: Ensure GitHub Actions can trigger deployments via a restricted user with limited permissions.
- Secrets management: Securely use SSH private keys and server IP as secrets in GitHub workflows.

### 6. Logging & Auditing

- Centralized logging: Capture detailed logs of all deployment steps, errors, and user actions.
- Audit trail: Maintain history of configuration changes and deployments for troubleshooting and compliance.

## Architectural Overview

- Modular Node.js codebase with clear separation of concerns (Config, SSH, Docker, Nginx, Secrets, Backup, Migrations).
- Use of async/promises for network and file operations.
- Config-driven design with support for secret placeholders.
- Extensible modules to add new service types, backup strategies, or external secret providers.
- Secure secret storage and access control on the server side.

## Next Steps for Development

- [X] Build CLI commands for init, deploy, config sync, backup, and migrations.
- [X] Build reusable GitHub Actions for build/push/deploy workflows.
- [X] Develop secure secret management module with encrypted storage.
- [X] Create Nginx config generator supporting multiple domains and SPA rewrites.
- [ ] Integrate Flyway migration support with configurable migration script locations.
