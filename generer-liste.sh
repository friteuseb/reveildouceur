#!/bin/bash
# =============================================
# Génère la liste des articles (index.json)
# Usage: ./generer-liste.sh
# =============================================

cd "$(dirname "$0")"

# Trouver tous les fichiers HTML dans /articles/
# Exclure les templates
echo "Recherche des articles..."

articles=$(ls -1 articles/*.html 2>/dev/null | \
  grep -v "template" | \
  sed 's|articles/||g' | \
  sort -r)

if [ -z "$articles" ]; then
  echo "Aucun article trouvé."
  echo "[]" > articles/index.json
  exit 0
fi

# Générer le JSON
echo "[" > articles/index.json
first=true
for file in $articles; do
  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> articles/index.json
  fi
  echo -n "  \"$file\"" >> articles/index.json
done
echo "" >> articles/index.json
echo "]" >> articles/index.json

echo "✓ Liste générée dans articles/index.json"
echo ""
echo "Articles trouvés:"
cat articles/index.json
