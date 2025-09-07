#!/bin/bash
set -e

echo "Installing dependencies..."
npm install

echo "Building dynamic version for Vercel..."
npm run build

echo "Building static export for GitHub Pages..."

# Backup original next.config.ts
cp next.config.ts next.config.ts.bak

# Create temporary static export config
cat > next.config.ts << 'EOL'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'static-export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    TOKEN_GITHUB: process.env.TOKEN_GITHUB,
  },
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
EOL

# Build static export to a different directory
npm run build

# Restore original configuration
mv next.config.ts.bak next.config.ts

# Store current branch name
CURRENT_BRANCH=$(git branch --show-current)

echo "Preparing gh-pages branch..."
# Check if gh-pages branch exists
if git show-ref --quiet refs/heads/gh-pages; then
  git checkout gh-pages

  # Remove all files except .git, .nojekyll, and any other necessary files
  # Keep the .gitignore file if it exists
  find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.git' ! -name '.nojekyll' ! -name '.gitignore' -exec rm -rf {} +
else
  git checkout --orphan gh-pages
  # Initialize with a basic .gitignore
  echo "node_modules/" > .gitignore
  echo ".DS_Store" >> .gitignore
  echo "*.log" >> .gitignore
fi

# Ensure we have a proper .gitignore for the static site
cat > .gitignore << 'EOL'
node_modules/
.DS_Store
*.log
.next/
*.ts
*.tsx
components/
lib/
pages/api/
styles/
*.config.*
EOL

# Move static export files to root
if [ -d "../static-export" ]; then
  cp -r ../static-export/* .
  rm -rf ../static-export
fi

# Ensure critical files exist
touch .nojekyll

echo "Committing changes..."
git add --all
git commit -m "Static export: $(date +%Y-%m-%d_%H-%M-%S)" --allow-empty
git push origin gh-pages

echo "Switching back to original branch..."
git checkout "$CURRENT_BRANCH"

# Clean up any remaining static export files
rm -rf static-export

echo "Done! Static site deployed to gh-pages branch."
