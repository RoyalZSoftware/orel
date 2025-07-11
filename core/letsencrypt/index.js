import { spawn } from 'child_process';

/**
 * Runs a Certbot command with arguments.
 * @param {string[]} args - Array of certbot arguments
 * @returns {Promise<void>}
 */
function runCertbotCommand(args) {
  return new Promise((resolve, reject) => {
    const certbot = spawn('certbot', args, {
      stdio: 'inherit',
    });

    certbot.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Certbot exited with code ${code}`));
      }
    });
  });
}

/**
 * Obtain or renew certificates using Certbot with nginx plugin.
 * @param {string[]} domains - List of domain names
 * @param {string} email - Admin email
 * @param {boolean} staging - Whether to use staging environment
 */
export async function requestCertificates({ domains, email, staging = false }) {
  if (!domains || domains.length === 0) throw new Error('At least one domain is required');

  const args = [
    'certonly',
    '--standalone',
    '--non-interactive',
    '--agree-tos',
    '--email', email,
  ];

  if (staging) {
    args.push('--staging');
  }

  const validDomains = [];

  for (const domain of domains) {
    await runCertbotCommand([...args, '-d', domain])
    .then(() => {
      validDomains.push(domain);
    })
    .catch((err) => {
      console.error(err);
    });
  }

  return validDomains;
}
