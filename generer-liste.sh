#!/bin/bash
# =============================================
# Génère la liste des articles (index.json)
# avec support des catégories
# Usage: ./generer-liste.sh
# =============================================

cd "$(dirname "$0")"

INDEX_FILE="articles/index.json"
BACKUP_FILE="articles/index.json.bak"

# Définition des catégories
read -r -d '' CATEGORIES << 'EOF'
{
  "economie": { "label": "Économie", "color": "#3182ce" },
  "medias": { "label": "Médias", "color": "#805ad5" },
  "technologie": { "label": "Technologie", "color": "#00b5d8" },
  "environnement": { "label": "Environnement", "color": "#38a169" },
  "societe": { "label": "Société", "color": "#dd6b20" },
  "sante": { "label": "Santé", "color": "#e53e3e" },
  "geopolitique": { "label": "Géopolitique", "color": "#667eea" }
}
EOF

# Mots-clés pour détection automatique des catégories (par nom de fichier uniquement)
detect_category() {
  local filename="$1"

  # Économie
  if echo "$filename" | grep -qiE "salaire|argent|monetaire|securite-sociale|fiscale|economie|inflation|cout-|prix-|socialisme"; then
    echo "economie"
  # Médias
  elif echo "$filename" | grep -qiE "media|journal|fact-check|desinforme|presse|possede.*journal"; then
    echo "medias"
  # Technologie
  elif echo "$filename" | grep -qiE "telephone|ia-|data-center|techno|numerique|algorithme"; then
    echo "technologie"
  # Environnement
  elif echo "$filename" | grep -qiE "co2|climat|pollue|nucleaire|electrique|environnement|bio-|geoingenierie|verdissement|planete"; then
    echo "environnement"
  # Santé
  elif echo "$filename" | grep -qiE "sante|covid|pesticide|additif|medicament|pharma"; then
    echo "sante"
  # Géopolitique
  elif echo "$filename" | grep -qiE "ukraine|immigration|geopolitique|souverainete|dictature|salvador|guerre|democratie"; then
    echo "geopolitique"
  # Société (défaut)
  else
    echo "societe"
  fi
}

echo "Recherche des articles..."

# Trouver tous les fichiers HTML
articles=$(ls -1 articles/*.html 2>/dev/null | \
  grep -v "template" | \
  sort -r)

if [ -z "$articles" ]; then
  echo "Aucun article trouvé."
  echo '{"categories": {}, "articles": []}' > "$INDEX_FILE"
  exit 0
fi

# Charger les catégories existantes si le fichier existe et est au nouveau format
declare -A existing_categories
if [ -f "$INDEX_FILE" ] && grep -q '"categories"' "$INDEX_FILE" 2>/dev/null; then
  echo "Chargement des catégories existantes..."
  # Sauvegarde
  cp "$INDEX_FILE" "$BACKUP_FILE"

  # Utiliser jq si disponible, sinon grep/sed
  if command -v jq &> /dev/null; then
    while IFS='|' read -r file cat; do
      existing_categories["$file"]="$cat"
    done < <(jq -r '.articles[] | "\(.file)|\(.category)"' "$INDEX_FILE" 2>/dev/null)
  else
    # Fallback sans jq: extraire avec sed
    while read -r line; do
      file=$(echo "$line" | sed -n 's/.*"file": *"\([^"]*\)".*/\1/p')
      cat=$(echo "$line" | sed -n 's/.*"category": *"\([^"]*\)".*/\1/p')
      if [ -n "$file" ] && [ -n "$cat" ]; then
        existing_categories["$file"]="$cat"
      fi
    done < <(grep -o '{[^}]*"file"[^}]*}' "$INDEX_FILE")
  fi
  echo "  → ${#existing_categories[@]} catégories chargées"
fi

# Générer le nouveau JSON
echo "{" > "$INDEX_FILE"
echo "  \"categories\": $CATEGORIES," >> "$INDEX_FILE"
echo "  \"articles\": [" >> "$INDEX_FILE"

first=true
new_count=0
for filepath in $articles; do
  file=$(basename "$filepath")

  # Utiliser la catégorie existante ou détecter automatiquement
  if [ -n "${existing_categories[$file]}" ]; then
    category="${existing_categories[$file]}"
  else
    category=$(detect_category "$file")
    echo "  → Nouveau: $file → $category"
    ((new_count++))
  fi

  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$INDEX_FILE"
  fi
  echo -n "    { \"file\": \"$file\", \"category\": \"$category\" }" >> "$INDEX_FILE"
done

echo "" >> "$INDEX_FILE"
echo "  ]" >> "$INDEX_FILE"
echo "}" >> "$INDEX_FILE"

# Valider le JSON
total=$(echo "$articles" | wc -w)
if command -v jq &> /dev/null; then
  if jq empty "$INDEX_FILE" 2>/dev/null; then
    echo ""
    echo "✓ Liste générée: $total articles ($new_count nouveaux)"
  else
    echo "⚠ Erreur: JSON invalide - restauration du backup"
    [ -f "$BACKUP_FILE" ] && mv "$BACKUP_FILE" "$INDEX_FILE"
    exit 1
  fi
else
  echo ""
  echo "✓ Liste générée: $total articles"
fi

# Nettoyer le backup si tout va bien
[ -f "$BACKUP_FILE" ] && rm "$BACKUP_FILE"
