import { internalService } from "./services.js";
import { secret, volume } from "./common.js";

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

export function postgresDB(name = "postgres", _secret = secret("postgres_db")) {
  const config = {
    host: name,
    port: 5432,
    database: "main",
    user: "database_user",
    password: _secret,
  };

  const service = internalService({
    name: config.host,
    type: "docker",
    image: "postgres:16",
    volumes: [
      volume(name + "_db_data", "/var/lib/postgresql/data")
    ],
    env: {
      POSTGRES_USER: config.user,
      POSTGRES_PASSWORD: config.password,
      POSTGRES_DB: config.database,
    },
  });

  return {
    config,
    service
  };
}

export function mongoDB(name = "mongodb", _secret = secret("mongo_db")) {
  const config = {
    host: name,
    port: 27017,
    database: "main",
    user: "database_user",
    password: _secret,
  };
  const service = internalService({
    name: config.host,
    type: "docker",
    image: "mongo:6",
    volumes: [
      volume(name + "_db_data", "/data/db")
    ],
    env: {
      USER: config.user,
      PASSWORD: config.password,
      DATABASE: config.database,
    },
  });

  return {
    config,
    service
  };
}