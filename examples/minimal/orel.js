import { defineApp, defineService, postgresDB, useGitHubRegistry } from "../../dsl/index.js";

export default defineApp({
    domain: "example.royalzsoftware.de",
    containerRegistry: useGitHubRegistry("royalzsoftware/orel"),
    database: postgresDB(),
    tag: "latest",
    services: (db) => ([
        defineService({
            name: "backend",
            port: 8080,
            dockerfile: "./backend/dockerfile",
            path: "./backend",
            env: {
                DB_HOST: db.host,
                DB_PASSWORD: db.password,
                DB_USER: db.user,
                DB_DATABASE: db.database,
                DB_PORT: db.port,
            },
            nginx: {
                subdomain: "api",
            }
        }),
        defineService({
            port: 3000,
            name: "frontend",
            dockerfile: "./frontend/dockerfile",
            path: "./frontend",
            nginx: {
                subdomain: ""
            }
        })
    ]),
    autoSSL: false,
})

// yt-dlp -f best -o - "https://www.youtube.com/watch?v=LtaLQJVY1BQ" | \ ffmpeg -i - -ss 00:01:23 -to 00:01:45 -c copy output.mp4