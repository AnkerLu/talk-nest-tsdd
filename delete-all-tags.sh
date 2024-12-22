#!/bin/bash

# 删除所有本地 tag
echo "Deleting local tags..."
git tag | xargs git tag -d

# 删除所有远程 tag
echo "Deleting remote tags..."
git ls-remote --tags origin | awk '/refs\/tags/ {print $2}' | cut -d '/' -f 3 | xargs -I {} git push origin :refs/tags/{}

echo "All tags have been deleted!"
