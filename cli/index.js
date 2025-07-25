import { program } from "commander";
import { initServer } from "../init/setup.js";
import pkg from '../package.json' with { type: 'json' };
import { push } from "./commands/push.js";
import { pull } from "./commands/pull.js";
import { Config } from "../config.js";
import { newProject } from "./commands/new.js";
import { renewOrCreateCertificates } from "./commands/certs.js";

function ensureRootAccess() {
  if (process.getuid && process.getuid() !== 0) {
    throw new Error("This command must be run as root or via sudo.");
  }
}

program
.name("orel")
.description("Opinionated deployment framework for fullstack applications to debian systems.")
.version(pkg.version)

// Developer tasks
program
.command('new')
.description("Generates the template orel.config.js file along with the GitHub Actions workflow in the current working directory.")
.action(async (str, options) => {
    await newProject();
    console.log("New project initialized successfully.")
});

// Server tasks
program
.command('init')
.description("Initializes the server environment.")
.action((str, options) => {
    ensureRootAccess();
    return initServer();
});

program.command('certs')
.description("Issue or renew latest SSL certificates")
.option("-c, --config <path>", "Path to the orel.json deployment configuration file.", `/home/${Config.DEPLOYER_USERNAME}/orel.json`)
.action(async (options) => {
    ensureRootAccess();
    return renewOrCreateCertificates(options);
});

program
.command('pull')
.description("Pulls the latest containers and rebuilds nginx config and docker-compose.yml")
.option("-c, --config <path>", "Path to the orel.json deployment configuration file.", `/home/${Config.DEPLOYER_USERNAME}/orel.json`)
.option("-u, --username <username>", "Docker username")
.option("-p, --password <password>", "Docker password")
.action(async (options) => {
    ensureRootAccess();
    return pull(options);
});

program.command('logs')
.description("Investigate the logs of the project")
.option("-f, --follow", "Follow the logs.")
.action(async (options) => {
    ensureRootAccess();
    console.log("Coming soon. Use docker compose logs meanwhile.");
});

// CI tasks
program
.command('push')
.argument("host", "The host where to synchronize to")
.description("Builds docker images for the services and pushes them to the registry.")
.option("-c, --config <path>", "Path to the orel.js deployment configuration file.", "./orel.config.js")
.action(async (host, options) => {
    return push(host, options);
});

program.parse();