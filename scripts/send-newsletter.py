#!/usr/bin/env python3
"""
Script d'envoi de newsletter pour Réveil Douceur
Envoie un email aux abonnés quand un nouvel article est publié.

Usage:
    python3 scripts/send-newsletter.py slug-de-larticle
    python3 scripts/send-newsletter.py slug-de-larticle --test  # Envoie uniquement à l'admin
    python3 scripts/send-newsletter.py slug-de-larticle --preview  # Affiche l'email sans envoyer
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path
from html.parser import HTMLParser
import urllib.request
import urllib.error

# Configuration
SITE_URL = "https://reveildouceur.fr"
SITE_NAME = "Réveil Douceur"
LIST_ID = 7  # Newsletter Réveil Douceur
SENDER_ID = 3  # Expéditeur Réveil Douceur
SENDER_EMAIL = "contact@reveildouceur.fr"
SENDER_NAME = "Réveil Douceur"
TEST_EMAIL = "cyril.wolfangel@gmail.com"

# Chemin du projet
PROJECT_ROOT = Path(__file__).parent.parent
ARTICLES_DIR = PROJECT_ROOT / "articles"
IMAGES_DIR = PROJECT_ROOT / "images" / "illustrations"
CONFIG_FILE = PROJECT_ROOT / "config" / "brevo.php"


class HTMLMetaExtractor(HTMLParser):
    """Extrait les métadonnées d'un fichier HTML."""

    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.image = ""
        self.date = ""
        self.in_title = False
        self.in_h1 = False
        self.h1_text = ""

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == "title":
            self.in_title = True
        elif tag == "h1":
            self.in_h1 = True
        elif tag == "meta":
            name = attrs_dict.get("name", "").lower()
            prop = attrs_dict.get("property", "").lower()
            content = attrs_dict.get("content", "")

            if name == "description" or prop == "og:description":
                if not self.description:
                    self.description = content
            elif prop == "og:image":
                self.image = content
            elif prop == "og:title":
                if not self.title:
                    self.title = content
        elif tag == "time":
            if "datetime" in attrs_dict:
                self.date = attrs_dict["datetime"]

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False
        elif tag == "h1":
            self.in_h1 = False

    def handle_data(self, data):
        if self.in_title and not self.title:
            self.title = data.strip()
        elif self.in_h1 and not self.h1_text:
            self.h1_text = data.strip()


def load_brevo_config():
    """Charge la configuration Brevo depuis le fichier PHP."""
    if not CONFIG_FILE.exists():
        print(f"Erreur: Fichier de configuration non trouvé: {CONFIG_FILE}")
        sys.exit(1)

    content = CONFIG_FILE.read_text()

    # Extraire la clé API avec regex
    api_key_match = re.search(r"'api_key'\s*=>\s*'([^']+)'", content)
    if not api_key_match:
        print("Erreur: Clé API non trouvée dans la configuration")
        sys.exit(1)

    return api_key_match.group(1)


def extract_article_metadata(slug):
    """Extrait les métadonnées d'un article."""
    article_path = ARTICLES_DIR / f"{slug}.html"

    if not article_path.exists():
        print(f"Erreur: Article non trouvé: {article_path}")
        sys.exit(1)

    content = article_path.read_text(encoding="utf-8")

    parser = HTMLMetaExtractor()
    parser.feed(content)

    # Nettoyer le titre (retirer " - Réveil Douceur")
    title = parser.title or parser.h1_text
    title = re.sub(r'\s*[-–—]\s*Réveil Douceur\s*$', '', title).strip()

    # URL de l'article
    article_url = f"{SITE_URL}/articles/{slug}.html"

    # Image
    image_url = parser.image or f"{SITE_URL}/images/illustrations/{slug}.png"

    return {
        "title": title,
        "description": parser.description or "Découvrez notre nouvel article.",
        "url": article_url,
        "image": image_url,
        "date": parser.date,
        "slug": slug
    }


def generate_email_html(article):
    """Génère le template HTML de l'email."""
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{article["title"]}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; background-color: #f7f4f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f7f4f0;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #5B7B6F 0%, #4A6A5E 100%); padding: 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">{SITE_NAME}</h1>
                            <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Questionnez. Vérifiez. Pensez par vous-même.</p>
                        </td>
                    </tr>

                    <!-- Image -->
                    <tr>
                        <td>
                            <a href="{article["url"]}" target="_blank">
                                <img src="{article["image"]}" alt="{article["title"]}" width="600" style="display: block; width: 100%; height: auto;">
                            </a>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 35px 40px;">
                            <p style="margin: 0 0 15px; color: #5B7B6F; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Nouvel article</p>
                            <h2 style="margin: 0 0 20px; color: #2D3436; font-size: 24px; line-height: 1.3;">
                                <a href="{article["url"]}" target="_blank" style="color: #2D3436; text-decoration: none;">{article["title"]}</a>
                            </h2>
                            <p style="margin: 0 0 30px; color: #636E72; font-size: 16px; line-height: 1.6;">{article["description"]}</p>
                            <a href="{article["url"]}" target="_blank" style="display: inline-block; background-color: #5B7B6F; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">Lire l'article →</a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #2D3436; padding: 30px 40px; text-align: center;">
                            <p style="margin: 0 0 15px; color: #9BA3A7; font-size: 14px;">
                                Vous recevez cet email car vous êtes inscrit(e) à la newsletter de {SITE_NAME}.
                            </p>
                            <p style="margin: 0;">
                                <a href="{SITE_URL}" target="_blank" style="color: #7A9B8F; text-decoration: none; font-size: 14px;">Visiter le site</a>
                                <span style="color: #636E72; margin: 0 10px;">•</span>
                                <a href="{{{{ unsubscribe }}}}" style="color: #7A9B8F; text-decoration: none; font-size: 14px;">Se désinscrire</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>'''


def brevo_api_request(endpoint, method="GET", data=None, api_key=None):
    """Effectue une requête vers l'API Brevo."""
    url = f"https://api.brevo.com/v3/{endpoint}"

    headers = {
        "api-key": api_key,
        "accept": "application/json",
        "content-type": "application/json"
    }

    request_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=request_data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 204:
                return {"success": True}
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_body = e.read().decode("utf-8")
        print(f"Erreur API Brevo ({e.code}): {error_body}")
        return None


def send_newsletter(article, api_key, test_mode=False):
    """Crée et envoie la campagne newsletter."""

    html_content = generate_email_html(article)

    # Créer la campagne
    campaign_data = {
        "name": f"Newsletter - {article['title'][:50]}",
        "subject": f"📰 {article['title']}",
        "sender": {
            "name": SENDER_NAME,
            "email": SENDER_EMAIL
        },
        "htmlContent": html_content,
        "recipients": {"listIds": [LIST_ID]},
        "inlineImageActivation": False
    }

    print("Création de la campagne...")
    result = brevo_api_request("emailCampaigns", method="POST", data=campaign_data, api_key=api_key)

    if not result or "id" not in result:
        print("Erreur lors de la création de la campagne")
        return False

    campaign_id = result["id"]
    print(f"Campagne créée (ID: {campaign_id})")

    if test_mode:
        # Envoyer un test
        print(f"Envoi d'un email de test à {TEST_EMAIL}...")
        test_result = brevo_api_request(
            f"emailCampaigns/{campaign_id}/sendTest",
            method="POST",
            data={"emailTo": [TEST_EMAIL]},
            api_key=api_key
        )
        if test_result:
            print(f"✅ Email de test envoyé à {TEST_EMAIL}")
            return True
        else:
            print("❌ Erreur lors de l'envoi du test")
            return False
    else:
        # Envoyer la campagne
        print("Envoi de la campagne à tous les abonnés...")
        send_result = brevo_api_request(
            f"emailCampaigns/{campaign_id}/sendNow",
            method="POST",
            api_key=api_key
        )
        if send_result:
            print("✅ Newsletter envoyée avec succès!")
            return True
        else:
            print("❌ Erreur lors de l'envoi de la newsletter")
            return False


def main():
    parser = argparse.ArgumentParser(
        description="Envoie une newsletter pour un nouvel article"
    )
    parser.add_argument("slug", help="Slug de l'article (ex: mon-article)")
    parser.add_argument("--test", action="store_true", help="Envoie uniquement à l'admin pour test")
    parser.add_argument("--preview", action="store_true", help="Affiche l'email sans envoyer")

    args = parser.parse_args()

    # Charger la configuration
    api_key = load_brevo_config()

    # Extraire les métadonnées de l'article
    print(f"Chargement de l'article: {args.slug}")
    article = extract_article_metadata(args.slug)

    print(f"  Titre: {article['title']}")
    print(f"  URL: {article['url']}")
    print(f"  Image: {article['image']}")

    if args.preview:
        print("\n" + "="*60)
        print("PRÉVISUALISATION DE L'EMAIL")
        print("="*60)
        html = generate_email_html(article)
        # Sauvegarder pour prévisualisation
        preview_file = PROJECT_ROOT / "newsletter-preview.html"
        preview_file.write_text(html)
        print(f"\nTemplate sauvegardé: {preview_file}")
        print("Ouvrez ce fichier dans un navigateur pour prévisualiser.")
        return

    # Vérifier le nombre d'abonnés
    list_info = brevo_api_request(f"contacts/lists/{LIST_ID}", api_key=api_key)
    if list_info:
        subscriber_count = list_info.get("totalSubscribers", 0)
        print(f"\nAbonnés dans la liste: {subscriber_count}")

        if subscriber_count == 0 and not args.test:
            print("⚠️  Aucun abonné dans la liste. Utilisez --test pour envoyer un test.")
            return

    if args.test:
        print(f"\n🧪 Mode TEST - Envoi uniquement à {TEST_EMAIL}")
    else:
        confirm = input(f"\n⚠️  Envoyer la newsletter à {subscriber_count} abonné(s) ? (oui/non): ")
        if confirm.lower() not in ["oui", "o", "yes", "y"]:
            print("Envoi annulé.")
            return

    # Envoyer
    send_newsletter(article, api_key, test_mode=args.test)


if __name__ == "__main__":
    main()
