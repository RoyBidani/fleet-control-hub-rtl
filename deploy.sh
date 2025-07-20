#!/bin/bash

echo "🚀 Deploying Fleet Control Hub..."

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Deployment stopped."
    exit 1
fi

echo "✅ Build completed successfully"

# Check if server is running
if pgrep -f "simple-http-server.js" > /dev/null; then
    echo "🔄 Restarting server..."
    pkill -f "simple-http-server.js"
    sleep 2
else
    echo "▶️  Starting new server..."
fi

# Start the server in background
echo "🚀 Starting Fleet Control Hub server..."
PORT=3000 nohup node simple-http-server.js > server.log 2>&1 &

# Wait a moment for the server to start
sleep 3

# Check if server started successfully
if pgrep -f "simple-http-server.js" > /dev/null; then
    echo "✅ Server started successfully!"
    echo "🌐 Fleet Control Hub is available at: http://3.121.113.142:3000"
    echo "📱 QR codes redirect to: http://3.121.113.142:3000/vehicle/{vehicleId}"
    echo "📊 Admin login: username=admin, password=1234"
    echo "🔧 To create sample data, POST to: http://3.121.113.142:3000/api/test/sample-data"
    echo "📋 Server logs are available in: server.log"
    echo ""
    echo "🎯 New Features:"
    echo "  ✅ Vehicle navigation sidebar - easily browse all cars"
    echo "  ✅ QR code scanning in public form - camera integration"
    echo "  ✅ Enhanced QR vehicle pages with report & scheduling"
    echo "  ✅ Fixed maintenance page loading issues with debugging"
    echo "  ✅ Full DynamoDB sync for all data"
    echo "  ✅ Quick vehicle switching with search functionality"
    echo "  ✅ Report problems and schedule maintenance from QR pages"
else
    echo "❌ Server failed to start. Check server.log for details."
    exit 1
fi