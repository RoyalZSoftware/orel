/**
 * @typedef {Object} LetsEncryptConfiguration
 * @property {string} email
 */

export function letsencrypt(email) {
  return {type: "letsencrypt", email};
}
