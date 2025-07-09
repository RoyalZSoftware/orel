// remoteClient.js
import { NodeSSH } from "node-ssh";
import SftpClient from "ssh2-sftp-client";
import fs from "fs";

export class RemoteClient {
  constructor({ host, username }) {
    this.sshConfig = { host, username, agent: process.env.SSH_AUTH_SOCK, agentForward: true };
    this.ssh = new NodeSSH();
    this.sftp = new SftpClient();
  }

  async connect() {
    await this.ssh.connect(this.sshConfig);
    await this.sftp.connect(this.sshConfig);
  }

  async disconnect() {
    this.ssh.dispose();
    await this.sftp.end();
  }

  async runCommand(command, cwd = "/root") {
    const result = await this.ssh.execCommand(command, { cwd });
    if (result.stderr) {
      throw new Error(`Error: '${command}': ${result.stderr}`);
    }
    return result.stdout;
  }

  async uploadFile(localPath, remotePath) {
    await this.sftp.put(localPath, remotePath);
  }

  async uploadDirectory(localDir, remoteDir) {
    if (!fs.existsSync(localDir)) {
      throw new Error(`Local directory does not exist. ${localDir}`);
    }
    await this.sftp.uploadDir(localDir, remoteDir);
  }
}
