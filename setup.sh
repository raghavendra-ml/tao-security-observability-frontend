#!/bin/bash

echo "🚀 Setting up Security Monitoring Dashboard Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="14.0.0"

if ! node -e "process.exit(process.version.slice(1).split('.').map(Number).reduce((acc, val, idx) => acc || (val - '$REQUIRED_VERSION'.split('.')[idx]), 0) >= 0 ? 0 : 1)"; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to version 14 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "🔧 Creating environment configuration file..."
    cat > .env << EOL
# API Configuration
REACT_APP_API_URL=http://localhost:8000

# App Configuration
REACT_APP_NAME="Security Monitoring Dashboard"
REACT_APP_VERSION=1.0.0

# Optional: Enable/disable features
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_CHARTS=true
EOL
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Make sure your FastAPI backend is running on http://localhost:8000"
echo "2. Run 'npm start' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  npm start     - Start development server"
echo "  npm build     - Build for production"
echo "  npm test      - Run tests"
echo ""
