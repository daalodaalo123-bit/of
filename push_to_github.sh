#!/bin/bash

echo "🚀 Pushing FOD Clinic code to GitHub..."
echo ""
echo "Repository: https://github.com/daalodaalo123-bit/of"
echo ""

# Check if already pushed
if git ls-remote --heads origin main &>/dev/null; then
    echo "⚠️  Remote branch exists. Pulling first..."
    git pull origin main --no-rebase || echo "Could not pull, continuing..."
fi

echo "📤 Pushing to GitHub..."
echo ""
echo "You will be prompted for credentials:"
echo "Username: daalodaalo123-bit"
echo "Password: Use a GitHub Personal Access Token (not your password)"
echo ""
echo "Get token from: https://github.com/settings/tokens"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "🌐 View at: https://github.com/daalodaalo123-bit/of"
else
    echo ""
    echo "❌ Push failed. You may need to:"
    echo "1. Create a Personal Access Token: https://github.com/settings/tokens"
    echo "2. Use the token as password when prompted"
    echo "3. Or run: git push -u origin main"
fi
