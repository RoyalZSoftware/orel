import { internalService } from "./services.js";

/**
 * @typedef {Object} DatabaseConfiguration
 * @property {string} host
 * @property {number} port
 * @property {string} database
 * @property {string} user
 * @property {string} password
 */

/**
 * @typedef {Object} DatabaseAdapter
 * @property {import("./services").ServiceDefinition} service
 * @property {DatabaseConfiguration} config
 */

export function postgresDB() {
  const config = {
    host: "db",
    port: 5432,
    database: "main",
    user: "database_user",
    password: secret("db"),
  };

  const service = internalService({
    name: config.host,
    type: "docker",
    image: "postgres:16",
    volumes: [
      volume("psql_db_data", "/var/lib/postgresql/data")
    ],
    env: {
      POSTGRES_USER: config.user,
      POSTGRES_PASSWORD: config.password,
      POSTGRES_DB: config.database,
    },
    backup: true,
  });

  return {
    config,
    service
  };
}

export function mongoDB() {
  const config = {
    host: "db",
    port: 27017,
    database: "main",
    user: "database_user",
    password: secret("db"),
  };
  const service = internalService({
    name: config.host,
    type: "docker",
    image: "mongo:6",
    volumes: [
      volume("mongo_db_data", "/data/db")
    ],
    env: {
      USER: config.user,
      PASSWORD: config.password,
      DATABASE: config.database,
    },
    backup: true,
  });

  return {
    config,
    service
  };
}