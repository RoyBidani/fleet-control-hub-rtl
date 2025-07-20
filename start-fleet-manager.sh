#!/bin/bash

# Fleet Manager Start Script
# This script builds and starts the Fleet Control Hub on port 8080

echo "🚀 Starting Fleet Control Hub Manager..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Set environment variables
export PORT=3001
export NODE_ENV=production

# Start the server
echo "🌐 Starting Fleet Manager backend on port 3001..."
echo "🔗 Access the application at: http://3.121.113.142:8080 (via nginx proxy)"
echo "⚠️  Note: Backend runs on port 3001, nginx on port 8080 proxies to it"
echo "⚠️  This setup does not affect the SSD_MANAGER service running on port 80"

# Start the API server
node api-server.js