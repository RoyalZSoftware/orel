import {
  defineApp,
  defineService,
  flywayMigrations,
  mongoDB,
  useGitHubRegistry,
} from "../dsl/index.js";

export default defineApp({
  tag: "latest",
  domain: "rebrandbox.com",
  containerRegistry: useGitHubRegistry("royalzsoftware/rebrandbox"),
  database: mongoDB(),
  services: (db) => ([
    flywayMigrations(db),
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
        DB_HOST: db.host,
        DB_USER: db.user,
        DB_PASSWORD: db.password,
        DB_DATABASE: db.database,
      }
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
  ]),
});
