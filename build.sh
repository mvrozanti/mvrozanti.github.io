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
  distDir: 'docs',
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

# Build static export
npm run build

# Restore original configuration
mv next.config.ts.bak next.config.ts

# Store current branch name
CURRENT_BRANCH=$(git branch --show-current)

# Move the built files to a temporary location outside the git repo
TMP_DIR=$(mktemp -d)
mv docs "$TMP_DIR/"

echo "Preparing gh-pages branch..."
# Check if gh-pages branch exists
if git show-ref --quiet refs/heads/gh-pages; then
  git checkout gh-pages

  # Remove all files except .git, .nojekyll, and .gitignore
  find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.git' ! -name '.nojekyll' ! -name '.gitignore' -exec rm -rf {} +
else
  git checkout --orphan gh-pages
  # Remove any files that might be in the new branch
  git rm -rf . 2>/dev/null || true
fi

# Move static export files from temporary location
mv "$TMP_DIR/docs/"* .
rm -rf "$TMP_DIR"

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

# Ensure critical files exist
touch .nojekyll

echo "Committing changes..."
git add --all
git commit -m "Static export: $(date +%Y-%m-%d_%H-%M-%S)" --allow-empty
git push origin gh-pages

echo "Switching back to original branch..."
git checkout "$CURRENT_BRANCH"

# Clean up any remaining files
rm -rf docs

echo "Done! Static site deployed to gh-pages branch."
