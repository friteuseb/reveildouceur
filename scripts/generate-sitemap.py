#!/usr/bin/env python3
"""
Génère automatiquement le sitemap.xml à partir de articles/index.json
Usage: python3 scripts/generate-sitemap.py
"""

import json
import os
from datetime import datetime
from pathlib import Path

# Configuration
BASE_URL = "https://reveildouceur.fr"
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
ARTICLES_INDEX = PROJECT_ROOT / "articles" / "index.json"
SITEMAP_PATH = PROJECT_ROOT / "sitemap.xml"

# Pages statiques avec leurs priorités
STATIC_PAGES = [
    {"loc": "/", "priority": "1.0", "changefreq": "weekly"},
    {"loc": "/a-propos.html", "priority": "0.8", "changefreq": "monthly"},
    {"loc": "/contact.html", "priority": "0.6", "changefreq": "monthly"},
]


def extract_date_from_filename(filename: str) -> str:
    """Extrait la date du nom de fichier (format YYYY-MM-DD_slug.html)"""
    try:
        date_part = filename.split("_")[0]
        # Valide le format
        datetime.strptime(date_part, "%Y-%m-%d")
        return date_part
    except (IndexError, ValueError):
        return datetime.now().strftime("%Y-%m-%d")


def generate_sitemap() -> str:
    """Génère le contenu XML du sitemap"""

    # Charger les articles
    with open(ARTICLES_INDEX, "r", encoding="utf-8") as f:
        data = json.load(f)

    articles = data.get("articles", [])

    # Construire le XML
    xml_parts = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]

    # Pages statiques
    today = datetime.now().strftime("%Y-%m-%d")
    for page in STATIC_PAGES:
        xml_parts.append(f"""  <url>
    <loc>{BASE_URL}{page['loc']}</loc>
    <lastmod>{today}</lastmod>
    <changefreq>{page['changefreq']}</changefreq>
    <priority>{page['priority']}</priority>
  </url>""")

    # Articles
    for article in articles:
        filename = article.get("file", "")
        if not filename:
            continue

        date = extract_date_from_filename(filename)
        loc = f"{BASE_URL}/articles/{filename}"

        xml_parts.append(f"""  <url>
    <loc>{loc}</loc>
    <lastmod>{date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>""")

    xml_parts.append("</urlset>")

    return "\n".join(xml_parts)


def main():
    """Point d'entrée principal"""
    print(f"Génération du sitemap...")
    print(f"  Source: {ARTICLES_INDEX}")
    print(f"  Destination: {SITEMAP_PATH}")

    # Vérifier que index.json existe
    if not ARTICLES_INDEX.exists():
        print(f"Erreur: {ARTICLES_INDEX} introuvable")
        return 1

    # Générer le sitemap
    sitemap_content = generate_sitemap()

    # Compter les URLs
    url_count = sitemap_content.count("<url>")

    # Écrire le fichier
    with open(SITEMAP_PATH, "w", encoding="utf-8") as f:
        f.write(sitemap_content)

    print(f"Sitemap généré avec {url_count} URLs")
    return 0


if __name__ == "__main__":
    exit(main())
