#!/usr/bin/env python3
"""
Script de calcul de similarite semantique entre articles et injection de cartes "Sur le meme theme".

Utilise soit:
- sentence-transformers (local, gratuit) - par defaut
- OpenAI API (payant, necessite cle API dans .env)

Usage:
    python scripts/generate-related-articles.py              # Mode local (sentence-transformers)
    python scripts/generate-related-articles.py --openai     # Mode OpenAI API
    python scripts/generate-related-articles.py --dry-run    # Simulation sans modification
    python scripts/generate-related-articles.py --force      # Force la regeneration meme si deja present
"""

import os
import sys
import json
import re
import argparse
import hashlib
import pickle
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from bs4 import BeautifulSoup
import numpy as np

# Configuration
ARTICLES_DIR = Path(__file__).parent.parent / "articles"
CACHE_DIR = Path(__file__).parent.parent / ".similarity_cache"
INDEX_FILE = ARTICLES_DIR / "index.json"
NUM_RELATED = 3  # Nombre d'articles similaires a afficher
SIMILARITY_THRESHOLD = 0.3  # Seuil minimum de similarite

@dataclass
class Article:
    """Representation d'un article"""
    slug: str
    title: str
    content: str
    excerpt: str
    category: str
    category_label: str
    category_color: str
    file_path: Path

    def __hash__(self):
        return hash(self.slug)


class SimilarityCalculator:
    """Classe abstraite pour le calcul de similarite"""

    def encode(self, texts: List[str]) -> np.ndarray:
        raise NotImplementedError

    def similarity(self, embeddings: np.ndarray) -> np.ndarray:
        """Calcule la matrice de similarite cosinus"""
        # Normalisation
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms = np.where(norms == 0, 1, norms)  # Eviter division par zero
        normalized = embeddings / norms
        # Similarite cosinus
        return np.dot(normalized, normalized.T)


class LocalSimilarityCalculator(SimilarityCalculator):
    """Calcul de similarite avec sentence-transformers (local)"""

    def __init__(self):
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            print("Installation de sentence-transformers...")
            os.system(f"{sys.executable} -m pip install sentence-transformers")
            from sentence_transformers import SentenceTransformer

        print("Chargement du modele multilingual...")
        # Modele multilingual performant pour le francais
        self.model = SentenceTransformer('sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2')
        print("Modele charge.")

    def encode(self, texts: List[str]) -> np.ndarray:
        print(f"Encodage de {len(texts)} textes...")
        return self.model.encode(texts, show_progress_bar=True)


class OpenAISimilarityCalculator(SimilarityCalculator):
    """Calcul de similarite avec OpenAI API"""

    def __init__(self, api_key: str):
        try:
            from openai import OpenAI
        except ImportError:
            print("Installation de openai...")
            os.system(f"{sys.executable} -m pip install openai")
            from openai import OpenAI

        self.client = OpenAI(api_key=api_key)
        self.model = "text-embedding-3-small"

    def encode(self, texts: List[str]) -> np.ndarray:
        print(f"Encodage de {len(texts)} textes via OpenAI API...")
        embeddings = []

        # Traitement par batch de 100
        batch_size = 100
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            print(f"  Batch {i//batch_size + 1}/{(len(texts)-1)//batch_size + 1}...")

            response = self.client.embeddings.create(
                model=self.model,
                input=batch
            )

            for item in response.data:
                embeddings.append(item.embedding)

        return np.array(embeddings)


def load_index() -> Tuple[Dict, List[Dict]]:
    """Charge index.json et retourne categories + articles"""
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('categories', {}), data.get('articles', [])


def extract_article_content(file_path: Path, categories: Dict, article_meta: Dict) -> Optional[Article]:
    """Extrait le contenu d'un article HTML"""
    if not file_path.exists():
        return None

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
    except Exception as e:
        print(f"  Erreur lecture {file_path}: {e}")
        return None

    # Extraire le titre
    title_tag = soup.find('h1', class_='article__title')
    if not title_tag:
        title_tag = soup.find('h1')
    title = title_tag.get_text(strip=True) if title_tag else file_path.stem

    # Extraire le contenu principal
    content_div = soup.find('div', class_='article__content')
    if content_div:
        # Supprimer les scripts et styles
        for tag in content_div.find_all(['script', 'style', 'aside']):
            tag.decompose()
        content = content_div.get_text(separator=' ', strip=True)
    else:
        # Fallback sur tout le body
        body = soup.find('body')
        if body:
            for tag in body.find_all(['script', 'style', 'nav', 'header', 'footer', 'aside']):
                tag.decompose()
            content = body.get_text(separator=' ', strip=True)
        else:
            content = ""

    # Extraire l'excerpt (meta description ou premiers mots)
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    if meta_desc and meta_desc.get('content'):
        excerpt = meta_desc['content']
    else:
        # Premiers 150 caracteres du contenu
        excerpt = content[:150] + "..." if len(content) > 150 else content

    # Obtenir la categorie
    cat_key = article_meta.get('category', 'societe')
    cat_info = categories.get(cat_key, {'label': 'Societe', 'color': '#dd6b20'})

    slug = file_path.stem

    return Article(
        slug=slug,
        title=title,
        content=f"{title} {content}",  # Titre + contenu pour meilleure similarite
        excerpt=excerpt[:150] + "..." if len(excerpt) > 150 else excerpt,
        category=cat_key,
        category_label=cat_info.get('label', cat_key.capitalize()),
        category_color=cat_info.get('color', '#dd6b20'),
        file_path=file_path
    )


def get_cache_key(articles: List[Article], use_openai: bool) -> str:
    """Genere une cle de cache basee sur les articles"""
    content_hash = hashlib.md5()
    for article in sorted(articles, key=lambda a: a.slug):
        content_hash.update(article.slug.encode())
        content_hash.update(article.content[:500].encode())
    content_hash.update(b'openai' if use_openai else b'local')
    return content_hash.hexdigest()


def load_cached_similarities(cache_key: str) -> Optional[np.ndarray]:
    """Charge les similarites depuis le cache"""
    cache_file = CACHE_DIR / f"{cache_key}.pkl"
    if cache_file.exists():
        try:
            with open(cache_file, 'rb') as f:
                return pickle.load(f)
        except Exception:
            cache_file.unlink()
    return None


def save_cached_similarities(cache_key: str, similarities: np.ndarray):
    """Sauvegarde les similarites dans le cache"""
    CACHE_DIR.mkdir(exist_ok=True)
    cache_file = CACHE_DIR / f"{cache_key}.pkl"
    with open(cache_file, 'wb') as f:
        pickle.dump(similarities, f)


def find_related_articles(
    articles: List[Article],
    similarity_matrix: np.ndarray,
    num_related: int = NUM_RELATED
) -> Dict[str, List[Tuple[Article, float]]]:
    """Trouve les articles les plus similaires pour chaque article"""
    related = {}

    for i, article in enumerate(articles):
        # Obtenir les scores de similarite pour cet article
        scores = similarity_matrix[i]

        # Trier par score decroissant (exclure l'article lui-meme)
        scored_articles = [
            (articles[j], scores[j])
            for j in range(len(articles))
            if j != i and scores[j] >= SIMILARITY_THRESHOLD
        ]
        scored_articles.sort(key=lambda x: x[1], reverse=True)

        # Garder les N meilleurs
        related[article.slug] = scored_articles[:num_related]

    return related


def generate_related_html(related_articles: List[Tuple[Article, float]]) -> str:
    """Genere le HTML pour la section articles similaires"""
    if not related_articles:
        return ""

    cards_html = []
    for article, score in related_articles:
        # Determiner l'image (webp thumb ou png)
        thumb_path = f"/images/illustrations/{article.slug}-thumb.webp"

        card = f'''<a class="related-card" href="/articles/{article.slug}.html">
<div class="related-card__image">
<img src="{thumb_path}" alt="{article.title}" loading="lazy"/>
<span class="related-card__category" style="background-color: {article.category_color}">{article.category_label}</span>
</div>
<div class="related-card__content">
<h4 class="related-card__title">{article.title}</h4>
<p class="related-card__excerpt">{article.excerpt}</p>
</div>
</a>'''
        cards_html.append(card)

    return f'''<!-- Section Articles Similaires -->
<aside class="related-articles">
<h3 class="related-articles__title">Sur le meme theme</h3>
<div class="related-articles__grid">
{chr(10).join(cards_html)}
</div>
</aside>'''


def has_related_section(soup: BeautifulSoup) -> bool:
    """Verifie si l'article a deja une section articles similaires"""
    return soup.find('aside', class_='related-articles') is not None


def inject_related_articles(
    article: Article,
    related_html: str,
    dry_run: bool = False,
    force: bool = False
) -> bool:
    """Injecte la section articles similaires dans l'article HTML"""
    with open(article.file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Verifier si deja present
    existing = soup.find('aside', class_='related-articles')
    if existing:
        if not force:
            return False
        # Supprimer l'existant
        existing.decompose()

    # Trouver le meilleur endroit pour inserer
    # Priorite: avant article__sources, sinon avant footer-include, sinon a la fin de article
    insert_before = None

    sources = soup.find('aside', class_='article__sources')
    if sources:
        insert_before = sources
    else:
        footer = soup.find('div', id='footer-include')
        if footer:
            insert_before = footer

    # Parser le HTML a inserer
    related_soup = BeautifulSoup(related_html, 'html.parser')

    if insert_before:
        insert_before.insert_before(related_soup)
    else:
        # Fallback: ajouter a la fin de l'article
        article_tag = soup.find('article')
        if article_tag:
            article_tag.append(related_soup)
        else:
            # Dernier recours: avant </body>
            body = soup.find('body')
            if body:
                body.append(related_soup)

    if not dry_run:
        # Ecrire le fichier modifie
        with open(article.file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))

    return True


def main():
    parser = argparse.ArgumentParser(
        description="Genere les sections 'Sur le meme theme' pour les articles"
    )
    parser.add_argument('--openai', action='store_true',
                       help="Utiliser OpenAI API (necessite OPENAI_API_KEY dans .env)")
    parser.add_argument('--dry-run', action='store_true',
                       help="Simulation sans modification des fichiers")
    parser.add_argument('--force', action='store_true',
                       help="Force la regeneration meme si deja present")
    parser.add_argument('--no-cache', action='store_true',
                       help="Ignore le cache et recalcule les similarites")
    parser.add_argument('--article', type=str,
                       help="Traiter uniquement cet article (slug)")
    args = parser.parse_args()

    print("=" * 60)
    print("Generation des articles similaires")
    print("=" * 60)

    # Charger l'index
    print("\nChargement de index.json...")
    categories, articles_meta = load_index()
    print(f"  {len(categories)} categories, {len(articles_meta)} articles")

    # Charger tous les articles
    print("\nExtraction du contenu des articles...")
    articles = []
    articles_meta_dict = {}

    for meta in articles_meta:
        filename = meta.get('file', '')
        if not filename.endswith('.html'):
            continue

        # Ignorer les quizz a la racine
        if meta.get('href', '').startswith('/miroir'):
            continue

        file_path = ARTICLES_DIR / filename
        articles_meta_dict[filename] = meta

        article = extract_article_content(file_path, categories, meta)
        if article:
            articles.append(article)
            print(f"  OK: {article.slug}")
        else:
            print(f"  SKIP: {filename}")

    print(f"\n{len(articles)} articles charges.")

    if len(articles) < 2:
        print("Pas assez d'articles pour calculer les similarites.")
        return

    # Initialiser le calculateur de similarite
    if args.openai:
        # Charger la cle API depuis .env
        env_file = Path(__file__).parent.parent / ".env"
        api_key = None
        if env_file.exists():
            with open(env_file) as f:
                for line in f:
                    if line.startswith('OPENAI_API_KEY='):
                        api_key = line.split('=', 1)[1].strip().strip('"\'')
                        break

        if not api_key:
            api_key = os.environ.get('OPENAI_API_KEY')

        if not api_key:
            print("Erreur: OPENAI_API_KEY non trouve dans .env ou environnement")
            return

        calculator = OpenAISimilarityCalculator(api_key)
    else:
        calculator = LocalSimilarityCalculator()

    # Verifier le cache
    cache_key = get_cache_key(articles, args.openai)
    similarity_matrix = None

    if not args.no_cache:
        similarity_matrix = load_cached_similarities(cache_key)
        if similarity_matrix is not None:
            print("\nUtilisation du cache de similarites.")

    if similarity_matrix is None:
        # Calculer les embeddings
        texts = [a.content for a in articles]
        embeddings = calculator.encode(texts)

        # Calculer la matrice de similarite
        print("\nCalcul de la matrice de similarite...")
        similarity_matrix = calculator.similarity(embeddings)

        # Sauvegarder dans le cache
        save_cached_similarities(cache_key, similarity_matrix)
        print("Similarites mises en cache.")

    # Trouver les articles similaires
    print("\nRecherche des articles similaires...")
    related = find_related_articles(articles, similarity_matrix)

    # Afficher un resume
    print("\n" + "=" * 60)
    print("Articles similaires trouves:")
    print("=" * 60)
    for article in articles:
        rel = related.get(article.slug, [])
        if rel:
            print(f"\n{article.title}:")
            for r, score in rel:
                print(f"  - {r.title} ({score:.2%})")

    # Filtrer si un article specifique est demande
    if args.article:
        articles = [a for a in articles if a.slug == args.article]
        if not articles:
            print(f"\nArticle '{args.article}' non trouve.")
            return

    # Injecter les sections HTML
    print("\n" + "=" * 60)
    print("Injection des sections HTML" + (" (DRY RUN)" if args.dry_run else ""))
    print("=" * 60)

    modified = 0
    skipped = 0

    for article in articles:
        rel = related.get(article.slug, [])
        if not rel:
            print(f"  SKIP (pas de similaires): {article.slug}")
            skipped += 1
            continue

        related_html = generate_related_html(rel)
        success = inject_related_articles(article, related_html, args.dry_run, args.force)

        if success:
            print(f"  {'SIMULE' if args.dry_run else 'MODIFIE'}: {article.slug}")
            modified += 1
        else:
            print(f"  SKIP (deja present): {article.slug}")
            skipped += 1

    print("\n" + "=" * 60)
    print(f"Resume: {modified} modifie(s), {skipped} ignore(s)")
    if args.dry_run:
        print("(Mode simulation - aucun fichier modifie)")
    print("=" * 60)


if __name__ == "__main__":
    main()
