#!/usr/bin/env python3
"""
Script pour générer les métadonnées complètes dans index.json
Élimine le problème N+1 requêtes HTTP en pré-calculant toutes les métadonnées

Usage:
    python3 scripts/generate-index-metadata.py
    python3 scripts/generate-index-metadata.py --dry-run  # Mode simulation
"""

import json
import os
import re
import sys
from datetime import datetime
from html.parser import HTMLParser
from pathlib import Path

# Chemins
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ARTICLES_DIR = PROJECT_ROOT / "articles"
INDEX_JSON = ARTICLES_DIR / "index.json"
IMAGES_DIR = PROJECT_ROOT / "images" / "illustrations"


class MetadataExtractor(HTMLParser):
    """Extracteur de métadonnées HTML"""

    def __init__(self):
        super().__init__()
        self.title = None
        self.description = None
        self.date = None
        self.og_image = None
        self.in_title = False
        self.in_h1 = False
        self.h1_text = ""
        self.title_text = ""
        self.current_tag = None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        self.current_tag = tag

        if tag == "title":
            self.in_title = True
            self.title_text = ""
        elif tag == "h1":
            self.in_h1 = True
            self.h1_text = ""
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")

            if name == "description" and content:
                self.description = content
            elif prop == "og:image" and content:
                self.og_image = content
            elif name == "article:published_time" or prop == "article:published_time":
                self.date = content
        elif tag == "time":
            dt = attrs_dict.get("datetime")
            if dt and not self.date:
                self.date = dt

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_title:
            self.title_text += data
        elif self.in_h1:
            self.h1_text += data


def extract_metadata_from_html(filepath):
    """Extrait les métadonnées d'un fichier HTML"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  Erreur lecture {filepath}: {e}")
        return None

    parser = MetadataExtractor()
    try:
        parser.feed(content)
    except Exception as e:
        print(f"  Erreur parsing {filepath}: {e}")
        return None

    # Extraction du titre
    title = None
    if parser.title_text:
        # Retirer le suffix " - Réveil Douceur"
        title = re.sub(r'\s*[-–—]\s*Réveil Douceur\s*$', '', parser.title_text, flags=re.IGNORECASE).strip()
    if not title and parser.h1_text:
        title = parser.h1_text.strip()
    if not title:
        # Fallback: nom du fichier
        title = filepath.stem.replace('-', ' ').replace('_', ' ').title()

    # Extraction de la description
    description = parser.description
    if not description:
        # Chercher le premier paragraphe significatif
        p_match = re.search(r'<p[^>]*>([^<]{50,})</p>', content, re.IGNORECASE)
        if p_match:
            description = re.sub(r'<[^>]+>', '', p_match.group(1)).strip()
            if len(description) > 200:
                description = description[:197].rsplit(' ', 1)[0] + '...'
    if not description:
        description = "Cliquez pour lire cet article..."

    # Extraction de la date
    date = None
    if parser.date:
        try:
            # Parser différents formats
            for fmt in ['%Y-%m-%d', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S%z']:
                try:
                    date = datetime.strptime(parser.date.split('+')[0].split('Z')[0], fmt.split('%z')[0].split('+')[0])
                    break
                except ValueError:
                    continue
        except Exception:
            pass

    if not date:
        # Chercher dans le nom de fichier
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filepath.name)
        if date_match:
            try:
                date = datetime.strptime(date_match.group(1), '%Y-%m-%d')
            except ValueError:
                pass

    if not date:
        # Utiliser la date de modification du fichier
        try:
            mtime = os.path.getmtime(filepath)
            date = datetime.fromtimestamp(mtime)
        except Exception:
            date = datetime.now()

    return {
        'title': title,
        'excerpt': description,
        'date': date.strftime('%Y-%m-%d') if date else datetime.now().strftime('%Y-%m-%d')
    }


def check_image_exists(slug):
    """Vérifie quelle image existe pour un article"""
    for ext in ['webp', 'png', 'jpg', 'jpeg']:
        thumb = IMAGES_DIR / f"{slug}-thumb.{ext}"
        if thumb.exists():
            return f"/images/illustrations/{slug}-thumb.{ext}"

    for ext in ['webp', 'png', 'jpg', 'jpeg']:
        img = IMAGES_DIR / f"{slug}.{ext}"
        if img.exists():
            return f"/images/illustrations/{slug}.{ext}"

    return None


def generate_metadata(dry_run=False):
    """Génère les métadonnées pour tous les articles dans index.json"""

    if not INDEX_JSON.exists():
        print(f"Erreur: {INDEX_JSON} n'existe pas")
        return False

    # Charger index.json existant
    with open(INDEX_JSON, 'r', encoding='utf-8') as f:
        data = json.load(f)

    if 'articles' not in data:
        print("Erreur: pas de clé 'articles' dans index.json")
        return False

    articles = data['articles']
    updated_count = 0
    skipped_count = 0
    error_count = 0

    print(f"Traitement de {len(articles)} articles...\n")

    for i, article in enumerate(articles):
        filename = article.get('file')
        if not filename:
            continue

        # Articles avec métadonnées inline (quizz externes) - on garde
        if article.get('href') and article.get('title'):
            print(f"[{i+1}/{len(articles)}] {filename} - métadonnées inline (conservées)")
            skipped_count += 1
            continue

        # Déterminer le chemin du fichier
        if filename.startswith('miroir-'):
            filepath = PROJECT_ROOT / filename
        else:
            filepath = ARTICLES_DIR / filename

        if not filepath.exists():
            print(f"[{i+1}/{len(articles)}] {filename} - FICHIER NON TROUVÉ")
            error_count += 1
            continue

        # Extraire les métadonnées
        metadata = extract_metadata_from_html(filepath)
        if not metadata:
            print(f"[{i+1}/{len(articles)}] {filename} - ERREUR EXTRACTION")
            error_count += 1
            continue

        # Vérifier l'image
        slug = filename.replace('.html', '')
        thumbnail = check_image_exists(slug)

        # Mettre à jour l'article
        article['title'] = metadata['title']
        article['excerpt'] = metadata['excerpt']
        article['date'] = metadata['date']
        if thumbnail:
            article['thumbnail'] = thumbnail

        print(f"[{i+1}/{len(articles)}] {filename}")
        print(f"    Titre: {metadata['title'][:50]}...")
        print(f"    Date: {metadata['date']}")
        updated_count += 1

    print(f"\n{'='*50}")
    print(f"Résumé:")
    print(f"  - Articles mis à jour: {updated_count}")
    print(f"  - Articles ignorés (inline): {skipped_count}")
    print(f"  - Erreurs: {error_count}")

    if dry_run:
        print(f"\nMode simulation - aucune modification effectuée")
        return True

    # Sauvegarder
    # Créer une sauvegarde
    backup_path = INDEX_JSON.with_suffix('.json.bak')
    with open(backup_path, 'w', encoding='utf-8') as f:
        with open(INDEX_JSON, 'r', encoding='utf-8') as orig:
            f.write(orig.read())
    print(f"\nSauvegarde créée: {backup_path}")

    # Écrire le nouveau fichier
    with open(INDEX_JSON, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"index.json mis à jour avec succès!")
    return True


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    success = generate_metadata(dry_run=dry_run)
    sys.exit(0 if success else 1)
