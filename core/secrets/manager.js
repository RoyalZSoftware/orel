export class SecretManager {
  constructor({ getSecret, secrets }) {
    this.getSecret = getSecret;
    this.secrets = secrets;
    this.secretPrefix = "__secret:";
  }

  isSecret(value) {
    return typeof value === "string" && value.startsWith(this.secretPrefix) && value.endsWith("__");
  }

  async listSecrets() {
    return this.secrets();
  }

  extractKey(secretValue) {
    return secretValue.slice(this.secretPrefix.length, -2);
  }

  async resolveSecrets(obj) {
    if (Array.isArray(obj)) {
      return Promise.all(obj.map((item) => this.resolveSecrets(item)));
    } else if (obj && typeof obj === "object") {
      const entries = Object.entries(obj).map(async ([k, v]) => [k, await this.resolveSecrets(v)])
      return Promise.all(Object.fromEntries(entries));
    } else if (this.isSecret(obj)) {
      const key = this.extractKey(obj);
      const secretValue = this.getSecret(key);
      if (secretValue === undefined) {
        throw new Error("Could not get secret for key: " + key);
      }
      return secretValue;
    }
    return obj;
  }
}
