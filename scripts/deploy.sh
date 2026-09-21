#!/usr/bin/env bash
# Publishes ./dist to gh-pages. Needs GH_TOKEN with `repo` scope.
set -euo pipefail
REPO="mihailingggggggg-star/elite-invest-app"
: "${GH_TOKEN:?set GH_TOKEN first}"
touch dist/.nojekyll
cd dist
rm -rf .git
git init -q
git config http.postBuffer 524288000
git config http.version HTTP/1.1
git checkout -qB gh-pages
git add -A
git -c user.email="deploy@eliteinvest" -c user.name="deploy" commit -q -m "Deploy $(date -u +%FT%TZ)"
git push -qf "https://x-access-token:${GH_TOKEN}@github.com/${REPO}.git" gh-pages:gh-pages
rm -rf .git
echo "https://mihailingggggggg-star.github.io/elite-invest-app/"
