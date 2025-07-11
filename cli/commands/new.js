import { cpSync, existsSync, mkdirSync } from "fs";
import path, { join } from "path";
import { fileURLToPath } from "url";
import { sh } from "../../core/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function newProject() {
  const githubWorkflowsDir = join(process.cwd(), ".github", "workflows");
  const workflowFile = join(githubWorkflowsDir, "orel.yml");
  const configFile = join(process.cwd(), "orel.config.js");

  if (existsSync(configFile) || existsSync(workflowFile)) {
    throw new Error("The workflow file or the config file already exists. Not overriding. Please remove them first if you want to continue.");
  }

  const templatesDir = join(__dirname, "..", "..", "templates");
  const expectedGitDir = join(process.cwd(), ".git");

  cpSync(
    join(templatesDir, "orel.config.js"),
    configFile
  );

  if (!existsSync(expectedGitDir)) {
    throw new Error("Should be run at the root of the git repository.");
  }

  mkdirSync(githubWorkflowsDir, { recursive: true });
  cpSync(
    join(templatesDir, "orel.workflow.yml"),
    workflowFile,
  );

  await sh("npm i -D @royalzsoftware/orel # For the dsl");
}
