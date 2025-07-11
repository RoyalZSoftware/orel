import { defineApp, exposedPort, exposedService, postgresDB, secret, useGitHubRegistry, useZitadel, letsencrypt } from '@royalzsoftware/orel';

export default defineApp({
    database: postgresDB(),
    containerRegistry: useGitHubRegistry("royalzsoftware/orel"),
    domain: "example.royalzsoftware.de",
    services: (db) => ([
        exposedService({
            name: "app",
            path: "./",
            port: exposedPort(5000),
            dockerfile: "./Dockerfile",
            env: {
                DB_HOST: db.host,
                DB_PASS: db.password,
                DB_USER: db.user,
                DB_DATABASE: db.database,
                DB_PORT: db.port,
                ZITADEL_REDIRECT_URI: "https://example.royalzsoftware.de/auth/callback",
                ZITADEL_CLIENT_ID: "327846760108064770",
                ZITADEL_DISCOVERY_URL: "https://auth.example.royalzsoftware.de/.well-known/openid-configuration",
                SECRET_KEY: secret('secret_key')
            }
        }, undefined, true),
        useZitadel("example.royalzsoftware.de")
    ]),
    letsencryptConfig: letsencrypt("panov@royalzsoftware.de"),
});