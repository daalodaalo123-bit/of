#!/bin/bash

echo "🚀 Starting Healthcare Backend API..."
echo ""

cd "$(dirname "$0")/backend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "✅ Starting server on http://localhost:3000"
echo "📡 API available at http://localhost:3000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
