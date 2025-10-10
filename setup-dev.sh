#!/bin/bash

# Quick setup script for local development
echo "🚀 Setting up Padely development environment..."
echo ""

# Check if .env.development already exists
if [ -f ".env.development" ]; then
    echo "⚠️  .env.development already exists"
    read -p "Do you want to overwrite it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted. Keeping existing .env.development"
        exit 1
    fi
fi

# Copy the example file
echo "📋 Copying .env.example to .env.development..."
cp .env.example .env.development

echo "✅ Created .env.development"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Open .env.development in your editor"
echo "2. Replace 'your_openai_api_key_here' with your actual API key"
echo "   Get your key from: https://platform.openai.com/api-keys"
echo ""
echo "3. Install dependencies:"
echo "   npm install"
echo ""
echo "4. Start the development server:"
echo "   npm run dev"
echo ""
echo "⚠️  IMPORTANT: Never commit .env.development to git!"
echo "   It's already in .gitignore for your protection."
echo ""
