#!/usr/bin/env bash
set -e
npm install
cp next.config.ts next.config.ts.bak
cat > next.config.ts << 'EOL'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
EOL
npx next build
mv next.config.ts.bak next.config.ts
CURRENT_BRANCH=$(git branch --show-current)
TMP_DIR=$(mktemp -d)
mv out "$TMP_DIR/"

echo "Preparing gh-pages branch..."
if git show-ref --quiet refs/heads/gh-pages; then
  git checkout gh-pages
  find . -maxdepth 1 ! -name '.' ! -name '..' ! -name '.git' ! -name '.nojekyll' ! -name '.gitignore' -exec rm -rf {} +
else
  git checkout --orphan gh-pages
  git rm -rf . 2>/dev/null || true
fi
mv "$TMP_DIR/out/"* .
rm -rf "$TMP_DIR"
cat > .gitignore << 'EOL'
node_modules/
.DS_Store
*.log
.next/
*.ts
*.tsx
components/
lib/
styles/
*.config.*
EOL
touch .nojekyll
echo "Committing changes..."
git add --all
git commit -m "Static export: $(date +%Y-%m-%d_%H-%M-%S)" --allow-empty
git push origin gh-pages
echo "Switching back to original branch..."
git checkout "$CURRENT_BRANCH"
rm -rf out
echo "Done! Static site deployed to gh-pages branch."
