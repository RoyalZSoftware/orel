export function ensureRootAccess() {
  if (process.getuid && process.getuid() !== 0) {
    throw new Error("This command must be run as root or via sudo.");
  }
}
