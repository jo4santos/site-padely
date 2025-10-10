#!/bin/bash

# Script to verify environment setup
echo "🔍 Checking environment setup..."
echo ""

# Check if .env.development exists locally
if [ -f ".env.development" ]; then
    echo "✅ .env.development exists locally"
    
    # Check if it has a valid API key (not placeholder)
    if grep -q "VITE_OPENAI_API_KEY=your_openai_api_key_here" .env.development; then
        echo "⚠️  WARNING: .env.development still has placeholder API key"
        echo "   → Please add your actual OpenAI API key"
    elif grep -q "VITE_OPENAI_API_KEY=sk-" .env.development; then
        echo "✅ OpenAI API key is configured in .env.development"
    else
        echo "⚠️  WARNING: VITE_OPENAI_API_KEY might not be set correctly"
    fi
else
    echo "❌ .env.development not found"
    echo "   → Run: cp .env.example .env.development"
    echo "   → Then add your OpenAI API key"
fi

echo ""
echo "📋 .gitignore check..."

# Check if .env files are properly ignored
if grep -q "^.env.development$" .gitignore; then
    echo "✅ .env.development is in .gitignore"
else
    echo "⚠️  WARNING: .env.development might not be ignored by git"
fi

if grep -q "^.env.production$" .gitignore; then
    echo "✅ .env.production is in .gitignore"
else
    echo "⚠️  WARNING: .env.production might not be ignored by git"
fi

echo ""
echo "🔒 Repository security check..."

# Check if any .env files are tracked by git (they shouldn't be!)
if git ls-files --error-unmatch .env.development 2>/dev/null; then
    echo "❌ CRITICAL: .env.development is tracked by git!"
    echo "   → This file should NEVER be in the repository"
    echo "   → It should already be removed. If you see this, something is wrong."
else
    echo "✅ .env.development is NOT tracked by git (correct!)"
fi

if git ls-files --error-unmatch .env.production 2>/dev/null; then
    echo "❌ CRITICAL: .env.production is tracked by git!"
    echo "   → This file should NEVER be in the repository"
    echo "   → It should already be removed. If you see this, something is wrong."
else
    echo "✅ .env.production is NOT tracked by git (correct!)"
fi

if git ls-files --error-unmatch .env.example 2>/dev/null; then
    echo "✅ .env.example is tracked by git (correct!)"
else
    echo "⚠️  WARNING: .env.example should be tracked by git"
fi

echo ""
echo "🎯 Summary:"
echo "   ✓ .env.example should be in git (template)"
echo "   ✗ .env.development should NOT be in git (local only)"
echo "   ✗ .env.production should NOT be in git (created by CI)"
echo ""
echo "📝 Next steps:"
echo "   1. Make sure .env.development exists locally with your API key"
echo "   2. Verify GitHub Secret OPENAI_API_KEY is set in repository settings"
echo "   3. Run 'npm run dev' to start development server"
echo ""
