import {
  defineApp,
  exposedPort,
  exposedService,
  internalService,
  mongoDB,
  secret,
  SPA_ROUTING_ENABLED,
  useGitHubRegistry,
  letsencrypt,
} from "@royalzsoftware/orel";

export default defineApp({
  domain: "example.com",
  database: mongoDB(), // auto configure the database and access the credentials later. Secret is auto generated.
  letsencryptConfig: letsencrypt("panov@royalzsoftware.de"),
  containerRegistry: useGitHubRegistry("royalzsoftware/orel"),
  services: (database) => ([
    exposedService({
      name: "api",
      path: "./backend", // provide the docker context where to build
      port: exposedPort(8000), // Provide the port that the server is running in the container (See the `EXPOSE` line in the Dockerfile)
      dockerfile: "./backend/dockerfile",
      env: {
        DB_HOST: database.host, // pass the database configuration from the adapter
        DB_USER: database.user,
        DB_PASS: database.password,
        DB_PORT: database.port,
        DB_DATABASE: database.database,
        JWT_KEY: secret("jwt_key"), // will be generated once and then stored across restarts.
      },
      /**
       * This service will be made accessible via https://api.example.com. The port is just for exposing to the host. Direct access is prohibited by the iptables rules.
       */
    }),
    exposedService(
      {
        name: "frontend",
        path: "./frontend",
        port: exposedPort(8000), // Provide the port that the server is running in the container (See the `EXPOSE` line in the Dockerfile)
        dockerfile: "./frontend/dockerfile",
      },
      SPA_ROUTING_ENABLED, // With this flag we rewrite all requests to the index.html file. Important for React, Angular, etc.
      true // isRootDomain? If yes, then don't use frontend.example.royalzsoftware.de. Rather use example.royalzsoftware.de
    ),
    internalService({
      /**
       * This service will not be accessible from outside. Only other services can access them via their name.
       * The database is an internal service for example.
       */
      name: "mailer",
      image: "mailserver/docker-mailserver:latest",
      env: {
        /**
         * The secrets are first going to be auto generated, which is pointless in this case.
         * However, just log onto the environment and change the secrets in /opt/orel/secrets/<secret_name>.
         * DO NOT TOUCH `/opt/orel/.env`. It will be auto generated.
         */
        SMTP_HOST: secret("smtp_host"),
        SMTP_USER: secret("smtp_user"),
        SMTP_PASSWORD: secret("smtp_password"),
      },
    }),
  ]),
});
