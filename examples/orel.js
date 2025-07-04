import { defineApp, defineService, secret, useGitHubRegistry, useMongo } from "../dsl/index.js";

export default defineApp({
  domain: "rebrandbox.com",
  containerRegistry: useGitHubRegistry('royalzsoftware/rebrandbox'),
  services: [
    useMongo({
      name: "db",
      user: "app",
      database: "app",
      password: secret("db"),
    }),
    defineService({
      name: "api",
      type: "docker",
      dockerfile: "./services/api/Dockerfile",
      path: "./services/api",
      port: 8080,
      nginx: {
        subdomain: "api",
      },
      env: {
        DB_HOST: "db",
        DB_USER: "app",
        DB_PASSWORD: secret("db"),
        DB_DATABASE: "rebrandbox",
      },
      migrate: {
        type: "flyway",
        path: "./services/api/migrations",
      },
    }),

    defineService({
      name: "app",
      type: "docker",
      dockerfile: "./services/app/Dockerfile",
      path: "./services/app",
      port: 3000,
      nginx: {
        subdomain: "app",
        spa: true, // enable history fallback
      },
    }),

    defineService({
      name: "landing",
      type: "docker",
      dockerfile: "./services/landing/Dockerfile",
      path: "./landing",
      nginx: {
        subdomain: "", // main domain
      },
    }),
  ],
});
