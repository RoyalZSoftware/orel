#!/bin/bash
set -e

echo "Updating apt repositories..."
sudo apt-get update

echo "Installing prerequisites..."
sudo apt-get install -y curl

echo "Adding NodeSource Node.js 18.x repository..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

echo "Installing Node.js 18.x..."
sudo apt-get install -y nodejs

echo "Checking node and npm versions..."
node -v
npm -v

echo "Installing @royalzsoftware/orel globally..."
sudo npm install -g @royalzsoftware/orel

echo "Installation complete."
