import path from 'path';
import { sh } from '../core/utils/sh.js';
import { Config } from './config.js';

/**
 * Erzeugt ein SSH-Keypair für den gegebenen Benutzer (z. B. deployfw),
 * schreibt den Public Key in authorized_keys,
 * und gibt Public und Private Key zurück.
 *
 * @param {{ username: string }} config
 * @returns {Promise<{ publicKey: string, privateKey: string }>}
 */
export async function setupSSH() {
  const username = Config.DEPLOYER_USERNAME;
  const sshDir = `/home/${username}/.ssh`;
  const keyPath = path.join(sshDir, 'id_ed25519');
  const pubKeyPath = `${keyPath}.pub`;
  const authorizedKeysPath = path.join(sshDir, 'authorized_keys');

  // 1. SSH-Verzeichnis anlegen
  await sh(`sudo -u ${username} mkdir -p ${sshDir}`);
  await sh(`sudo chmod 700 ${sshDir}`);
  await sh(`sudo chown -R ${username}:${username} ${sshDir}`);

  // 2. SSH-Key erzeugen, falls nicht vorhanden
  try {
    await sh(`sudo test -f ${keyPath}`);
  } catch {
    await sh(`sudo -u ${username} ssh-keygen -t ed25519 -N "" -f ${keyPath}`);
  }

  // 3. Public & Private Key lesen
  const publicKey = (await sh(`sudo cat ${pubKeyPath}`)).stdout.trim();
  const privateKey = (await sh(`sudo cat ${keyPath}`)).stdout.trim();

  // 4. Public Key in authorized_keys eintragen, wenn noch nicht vorhanden
  try {
    const existingKeys = (await sh(`sudo cat ${authorizedKeysPath}`)).stdout;
    if (!existingKeys.includes(publicKey)) {
      await sh(`echo '${publicKey}' | sudo tee -a ${authorizedKeysPath} > /dev/null`);
      await sh(`sudo chown ${username}:${username} ${authorizedKeysPath}`);
      await sh(`sudo chmod 600 ${authorizedKeysPath}`);
    }
  } catch {
    // Datei existiert nicht, neu anlegen
    await sh(`echo '${publicKey}' | sudo tee ${authorizedKeysPath} > /dev/null`);
    await sh(`sudo chown ${username}:${username} ${authorizedKeysPath}`);
    await sh(`sudo chmod 600 ${authorizedKeysPath}`);
  }

  return { publicKey, privateKey };
}
