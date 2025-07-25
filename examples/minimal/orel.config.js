import { letsencrypt, defineApp, exposedPort, exposedService, postgresDB, SPA_ROUTING_ENABLED, useGitHubRegistry, useZitadel } from "@royalzsoftware/orel";

export default defineApp({
    domain: "example.royalzsoftware.de",
    containerRegistry: useGitHubRegistry("royalzsoftware/orel"),
    database: postgresDB(),
    services: (db) => ([
        exposedService({
            name: "api",
            port: exposedPort(8001), // api.example.royalzsoftware.de
            dockerfile: "./backend/dockerfile",
            path: "./backend",
            env: {
                DB_HOST: db.host,
                DB_PASSWORD: db.password,
                DB_USER: db.user,
                DB_DATABASE: db.database,
                DB_PORT: db.port,
            },
        }),
        exposedService({
            port: exposedPort(8001),
            name: "frontend",
            dockerfile: "./frontend/dockerfile",
            path: "./frontend",
        }, SPA_ROUTING_ENABLED, true), // example.royalzsoftware.de
        useZitadel("example.royalzsoftware.de"),
    ]),
    letsencryptConfig: letsencrypt("panov@royalzsoftware.de"),
})