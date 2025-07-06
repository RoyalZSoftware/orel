#!/bin/bash
set -e

# Install nvm (Node Version Manager)
if ! command -v nvm &> /dev/null
then
  echo "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

  # Load nvm immediately for the script
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  echo "nvm already installed."
fi

# Install Node.js 18.10 and use it
echo "Installing and using Node.js 18.10..."
nvm install 18.10
nvm use 18.10

# Verify node and npm version
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Install your orel package globally
echo "Installing @royalzsoftware/orel globally..."
npm install -g @royalzsoftware/orel

echo "Done."
