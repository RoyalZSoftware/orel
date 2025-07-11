import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

export async function sh(cmd) {
  console.log(`Running command: ${cmd}`);
  try {
    const { stdout, stderr } = await execPromise(cmd);
    if (stdout) console.log(`stdout: ${stdout}`);
    if (stderr) console.error(`stderr: ${stderr}`);
    return { stdout, stderr };
  } catch (error) {
    console.error(`Command failed: ${cmd}`);
    console.error(error);
    throw error;
  }
}