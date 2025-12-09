#!/usr/bin/env python3
"""
Génère des illustrations stylisées pour les articles avec différentes APIs
Usage: python3 scripts/generate-illustrations.py [article.html]
       python3 scripts/generate-illustrations.py --all
       python3 scripts/generate-illustrations.py --missing
"""

import os
import sys
import json
import re
import base64
import urllib.parse
import requests
from pathlib import Path
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
REPLICATE_API_KEY = os.getenv("REPLICATE_API_KEY")

ARTICLES_DIR = Path(__file__).parent.parent / "articles"
IMAGES_DIR = Path(__file__).parent.parent / "images" / "illustrations"

# Style de prompt pour des illustrations cohérentes (Mœbius)
# IMPORTANT: Ce préfixe est ajouté AU DÉBUT du prompt pour ne pas être tronqué
STYLE_PREFIX = "Moebius Jean Giraud comic art style, clean ink lines, crosshatching, vibrant colors, surreal dreamlike, European bande dessinée, sci-fi retrofuturistic. "

# Suffixe pour les contraintes techniques (ajouté si place disponible)
STYLE_SUFFIX = "No text, no words, no letters in image. 16:9 landscape format."

# Prompts spécifiques pour éviter les images trop similaires
ARTICLE_SPECIFIC_PROMPTS = {
    # Environnement/Climat (éviter les "Terre verte depuis l'espace")
    "europe-seule-a-sauver-la-planete": "A tiny figure of Europe as Don Quixote tilting at giant industrial windmills, while massive smokestacks from China and USA loom in background, dramatic sunset sky",
    "co2-a-travers-les-ages-geologiques": "Split timeline showing prehistoric jungle with dinosaurs and volcanoes on left, ice age glaciers in middle, modern city on right, geological layers visible below",
    "verdissement-terre-co2-plantes": "Desert landscape transforming into lush forest, sand dunes becoming green hills, plants growing rapidly, time-lapse visualization of vegetation spreading",
    "nucleaire-francais-danger-ou-solution": "French countryside with elegant nuclear cooling towers shaped like champagne flutes, glowing atomic symbol in sky, peaceful pastoral scene with vineyards",
    "geoingenierie-le-dossier-complet": "Giant mirrors floating in space reflecting sunlight, planes spraying particles in stratosphere, Earth below with scientists manipulating weather, technological hubris",
    "voiture-electrique-bilan-carbone-reel": "Cutaway of electric car revealing battery made of tiny miners extracting lithium, charging cable splitting into coal smoke and wind turbine",
    "qui-pollue-vraiment-le-classement": "Giant factory smokestacks arranged like Olympic podium with country flags, CO2 clouds forming medal shapes, industrial skyline comparison",

    # Médias (éviter les "journaux volants")
    "qui-possede-votre-journal-prefere": "Nine billionaire figures as puppet masters holding strings attached to TV screens and newspapers, golden thrones arranged in circle, media empire visualization",
    "fact-checkers-le-dossier-complet": "Giant magnifying glass examining tiny fact-checkers who are themselves being examined by another magnifying glass, infinite recursion, who watches the watchmen",
    "qui-desinforme-vraiment-chiffres": "Two opposing megaphones facing each other, one labeled mainstream one labeled alternative, sound waves colliding and distorting in the middle, truth lost in noise",

    # Technologie (éviter les "circuits imprimés")
    "ia-consommation-eau-data-centers": "Massive data center servers submerged in blue water, water droplets evaporating into clouds, desert landscape with dried riverbed nearby, thirsty machines",
    "pourquoi-vous-ne-pouvez-pas-lacher-votre-telephone": "Human hand merged with smartphone, fingers becoming app icons, dopamine molecules floating around like butterflies, addiction visualization",
    "faire-confiance-aveuglement-quels-risques": "Person walking blindfolded on tightrope over canyon, guardian figures on both sides some helpful some pushing, trust and manipulation visual metaphor",
    "france-liberte-expression-ce-que-disent-les-chiffres": "Giant scissors cutting speech bubbles floating in French sky, Eiffel Tower in background, some bubbles escaping freely while others are trapped in glass jars, balance scale weighing freedom vs security, surveillance cameras shaped like eyes watching from clouds",
    "racailles-en-haut-vs-en-bas-qui-nuit-le-plus": "Split scene with diagonal divide: bottom half shows hooded street thug with broken window and stolen bike in gritty urban alley; top half shows wealthy businessman in suit sitting on golden throne made of money, pulling puppet strings attached to politicians and judges, giant balance scale in center dramatically tipped toward the rich side, stark contrast between petty crime below and massive corporate fraud above, French urban landscape with banlieue tower blocks and Parisian luxury buildings",
    "origines-de-lhomme-ce-que-dit-la-genetique": "Evolutionary tree of humanity visualized as intertwining DNA helixes, silhouettes of Homo sapiens, Neanderthal with prominent brow ridge, and mysterious Denisovan figure emerging from the strands, African savanna landscape transitioning to ice age Europe and Asian mountains, ancient cave paintings floating in background, double helix structure connecting all human figures, warm amber and cool blue color palette representing different lineages merging together",
    "pouvoir-des-narratifs-comment-les-histoires-faconnent-le-monde": "Giant puppet master hands made of newspaper pages and TV screens, pulling invisible strings attached to a crowd of silhouettes walking in same direction, some people breaking free and looking up at the hands, speech bubbles transforming into chains, a lone figure holding a magnifying glass examining the strings, dramatic chiaroscuro lighting, surreal dreamscape with floating headlines and broadcast towers in misty background",
    "autoritarisme-gauche-droite-meme-combat": "Horseshoe-shaped cliff with two armies facing each other at the top edges, one red with hammer and sickle banners, one black with nationalist flags, but as they march downward along the horseshoe curve they merge into identical grey uniformed soldiers at the bottom, all goose-stepping in unison, a lone figure in the center looking up at both sides with a lantern of truth, dramatic stormy sky, political allegory visualization",
    "quete-de-sens-spiritualite-sante-mentale": "Solitary figure standing at crossroads in vast empty landscape, one path leads to glowing ancient temple on hilltop with warm golden light and community of people, other path leads to neon-lit shopping mall and pill bottles floating in cold blue void, the figure holds an empty vessel shaped like a heart, stars and cosmic symbols swirling above the temple while the mall side has only advertising billboards, existential choice visualization, spiritual vs material dichotomy",
    "societe-moderne-fabrique-mal-etre": "Solitary human figure trapped inside a golden birdcage shaped like a smartphone, surrounded by infinite scrolling feeds and notification bells, the cage sits on a comfortable velvet cushion but the figure looks anxious and lonely, outside the cage on one side are bureaucratic forms and welfare office queues, on the other side are predatory corporate logos and gig economy symbols, broken family portraits and empty cradles scattered around, dopamine molecules floating like prison bars, other identical cages visible extending to infinity in cold blue corporate landscape, comfortable prison of modernity visualization, isolation despite connection paradox",

    # Société - Relations hommes/femmes et démographie
    "demographie-europeenne-le-sujet-tabou": "Map of Europe slowly fading from vibrant colors to grey, empty cradles and school desks, population pyramid inverting like hourglass running out, elderly figures outnumbering children, demographic transition visualization with taboo whisper symbols",
    "hommes-sensibles-ce-que-disent-les-etudes": "Masculine figure caught between two mirrors showing contrasting reflections: one side shows emotional vulnerability with soft watercolors, other side shows stoic mask cracking, women observing from shadows with thought bubbles showing contradictory preferences, psychological study visualization",
    "violence-psychologique-suicide-masculin-le-tabou": "Solitary male silhouette standing on edge of dark cliff, invisible chains made of words wrapping around him, broken support hotline telephone dangling, statistics floating like ghosts, heavy atmosphere of isolation and silence, mental health crisis visualization",

    # Cinéma et révélations
    "quand-le-cinema-nous-dit-la-verite": "Giant cinema screen splitting reality in half, left side shows mundane grey office workers in cubicles, right side reveals the hidden truth behind the screen with puppet strings attached to politicians and billionaires, a lone viewer in red seat wearing special sunglasses like in They Live, film reels transforming into scrolls of truth, Matrix-style green code cascading in corners, movie projector beam illuminating hidden symbols on dollar bills and TV screens, surreal revelation moment, Truman Show dome cracking above",

    # Société et cycles
    "temps-difficiles-hommes-forts-le-cycle-qui-nexiste-peut-etre-pas": "Circular wheel of history with four quadrants showing different generations: muscular warrior in ancient armor at top, comfortable businessman lounging in middle, young person with smartphone at bottom, then rising phoenix figure completing the cycle, BUT the wheel is cracked and broken showing it's a false construct, fragments floating away revealing complex gears and multiple intersecting factors beneath (economy, war, technology, disease), central figure examining the broken wheel with magnifying glass, skeptical expression, muted earth tones with gold accents",

    # Énergie/Pétrole
    "petrole-energie-fossile-limitee-vraiment": "Cross-section of Earth showing two competing theories of oil origin: surface layer with prehistoric swamp with dinosaurs and ancient forests decomposing into black liquid, deep underground layer showing primordial carbon bubbling up from Earth's molten core through cracks, oil derrick on surface piercing both layers, question mark made of oil drops floating above, Saturn's moon Titan visible in sky with methane lakes, hourglass filled with oil slowly draining but magically refilling from below, geological strata visible with fossils on one side and crystalline formations on other, scientific controversy visualization",

    # Éducation
    "ecole-francaise-comparaison-internationale": "Split scene classroom comparison: left side shows overcrowded French classroom with exhausted teacher drowning in paperwork and tired students at desks piled with books under harsh fluorescent lights, clock showing long hours, euro coins scattered but not reaching the teacher; right side shows bright Estonian classroom with small group of engaged students around modern technology, happy teacher with master's degree diploma on wall, sunlight streaming through windows; giant PISA ranking chart floating between both scenes showing France falling while Estonia rises, balance scale weighing hours vs results tipping wrong way, educational paradox visualization",

    # Madame Irma - Prédictions
    "jumeau-numerique-terre-simuler-avenir": "Massive holographic Earth floating in futuristic control room, translucent blue digital grid covering the planet surface, data streams flowing like rivers across continents, scientists in white coats monitoring multiple screens showing weather patterns and economic graphs, a butterfly with fractal wings symbolizing chaos theory in foreground, European Space Agency and Nvidia logos subtly visible, supercomputers with blinking lights lining the walls, split vision showing Earth simulation versus unpredictable human silhouettes walking in random directions, crystal ball cracked revealing circuit boards inside, prediction vs chaos visualization",
}

def extract_article_info(html_path):
    """Extrait le titre et le résumé d'un article HTML"""
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extraire le titre
    title_match = re.search(r'<title>([^<]+)</title>', content)
    title = title_match.group(1) if title_match else ""
    title = re.sub(r'\s*[-–—]\s*Réveil Douceur\s*$', '', title)

    # Extraire la description
    desc_match = re.search(r'<meta name="description" content="([^"]+)"', content)
    description = desc_match.group(1) if desc_match else ""

    return title, description

def generate_image_prompt(title, description, article_slug=None):
    """Génère un prompt pour l'illustration basé sur le contenu de l'article"""

    # Vérifier si on a un prompt spécifique pour cet article
    # STYLE_PREFIX au DÉBUT pour ne pas être tronqué par la limite de 500 caractères
    if article_slug and article_slug in ARTICLE_SPECIFIC_PROMPTS:
        prompt = f"{STYLE_PREFIX}{ARTICLE_SPECIFIC_PROMPTS[article_slug]}. {STYLE_SUFFIX}"
        return prompt

    # Mots-clés thématiques pour guider l'illustration
    keywords_mapping = {
        r"co2|carbone|climat|réchauffement|verdissement": "lush green Earth from space, vegetation growth, atmospheric layers",
        r"argent|monnaie|économie|salaire|prix|euro|fiscale?": "abstract golden coins flowing, economic graphs as art, currency symbols",
        r"santé|médecin|hôpital|covid|pesticide|additif": "medical symbols, DNA helix, health and wellness imagery",
        r"média|journal|information|presse|fact-check|désinforme": "newspapers floating, information streams, media landscape",
        r"technologie|ia|data|numérique|téléphone": "circuit boards as art, digital neural networks, technology abstract",
        r"politique|démocratie|gouvernement|socialisme": "parliament silhouettes, voting symbols, civic imagery",
        r"environnement|nature|pollution|nucléaire|électrique": "wind turbines, solar panels, clean energy visualization",
        r"société|social|population|femme|homme|bonheur": "diverse human silhouettes, social connections, community",
        r"ukraine|guerre|conflit|géopolitique|souveraineté": "world map with focus points, diplomatic chess pieces",
        r"religion|texte|sacré": "ancient books, spiritual light rays, philosophical imagery",
        r"immigration|démographie": "migration patterns, population flows, diverse faces silhouettes",
    }

    # Trouver les thèmes pertinents
    combined_text = f"{title} {description}".lower()
    visual_elements = []

    for pattern, elements in keywords_mapping.items():
        if re.search(pattern, combined_text):
            visual_elements.append(elements)

    if not visual_elements:
        visual_elements = ["abstract conceptual art, philosophical thinking"]

    # Construire le prompt avec STYLE_PREFIX au début pour ne pas être tronqué
    prompt = f"{STYLE_PREFIX}Editorial illustration: {visual_elements[0]}. {STYLE_SUFFIX}"

    return prompt

def generate_with_pollinations(prompt, output_path):
    """Génère une image avec Pollinations.ai (gratuit, sans clé)"""

    # Encoder le prompt pour l'URL
    encoded_prompt = urllib.parse.quote(prompt[:500])  # Limite de caractères

    # Pollinations supporte différents modèles
    # flux = haute qualité, turbo = rapide
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1280&height=720&model=flux&nologo=true"

    try:
        print(f"  → Génération avec Pollinations.ai...")
        response = requests.get(url, timeout=120, stream=True)

        if response.status_code == 200:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            print(f"  ✓ Image sauvegardée: {output_path.name}")
            return True
        else:
            print(f"  ❌ Erreur ({response.status_code})")
            return False

    except requests.exceptions.Timeout:
        print("  ❌ Timeout - réessayez")
        return False
    except Exception as e:
        print(f"  ❌ Erreur: {e}")
        return False

def generate_with_gemini(prompt, output_path):
    """Génère une image avec Google Gemini Imagen"""

    if not GOOGLE_API_KEY:
        return None  # Pas de clé, on skip

    # Essayer avec Imagen 3
    url = f"https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key={GOOGLE_API_KEY}"

    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {
            "sampleCount": 1,
            "aspectRatio": "16:9",
            "safetyFilterLevel": "block_medium_and_above"
        }
    }

    try:
        print(f"  → Tentative avec Gemini Imagen...")
        response = requests.post(url, json=payload, timeout=120)

        if response.status_code == 200:
            data = response.json()
            if "predictions" in data and data["predictions"]:
                image_data = data["predictions"][0].get("bytesBase64Encoded")
                if image_data:
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(output_path, "wb") as f:
                        f.write(base64.b64decode(image_data))
                    print(f"  ✓ Image sauvegardée: {output_path.name}")
                    return True
        return None  # Pas d'erreur affichée, on essaie le fallback

    except Exception:
        return None  # Fallback silencieux

def process_article(html_filename, force=False):
    """Traite un article et génère son illustration"""
    html_path = ARTICLES_DIR / html_filename

    if not html_path.exists():
        print(f"❌ Article non trouvé: {html_path}")
        return False

    # Nom de l'image de sortie
    image_name = html_filename.replace(".html", ".png")
    output_path = IMAGES_DIR / image_name

    # Vérifier si l'image existe déjà
    if output_path.exists() and not force:
        print(f"⏭ Existe déjà: {image_name}")
        return True

    print(f"\n📄 {html_filename}")

    # Extraire le slug de l'article (sans date et extension)
    # Ex: "2025-11-26_mon-article.html" -> "mon-article"
    article_slug = re.sub(r'^\d{4}-\d{2}-\d{2}_', '', html_filename.replace('.html', ''))

    # Extraire les infos de l'article
    title, description = extract_article_info(html_path)
    print(f"  Titre: {title[:50]}...")

    # Générer le prompt (avec slug pour les prompts spécifiques)
    prompt = generate_image_prompt(title, description, article_slug)

    # Essayer d'abord Gemini si disponible
    result = generate_with_gemini(prompt, output_path)

    # Fallback sur Pollinations
    if result is None:
        result = generate_with_pollinations(prompt, output_path)

    return result

def main():
    if len(sys.argv) < 2:
        print("🎨 Générateur d'illustrations pour Réveil Douceur")
        print("")
        print("Usage:")
        print("  python3 scripts/generate-illustrations.py article.html    # Un article")
        print("  python3 scripts/generate-illustrations.py --all           # Tous les articles")
        print("  python3 scripts/generate-illustrations.py --missing       # Seulement les manquants")
        print("  python3 scripts/generate-illustrations.py --force article # Regénérer")
        sys.exit(1)

    args = sys.argv[1:]
    force = "--force" in args
    if force:
        args.remove("--force")

    arg = args[0] if args else "--missing"

    if arg in ("--all", "--missing"):
        # Charger la liste des articles
        index_path = ARTICLES_DIR / "index.json"
        with open(index_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        articles = [a["file"] for a in data.get("articles", [])]

        print(f"🎨 Génération d'illustrations")
        print(f"   Articles: {len(articles)}")
        print(f"   Dossier: {IMAGES_DIR}")
        print(f"   Mode: {'Tous' if arg == '--all' else 'Manquants seulement'}")

        success = 0
        skipped = 0
        failed = 0

        for article in articles:
            image_name = article.replace(".html", ".png")
            output_path = IMAGES_DIR / image_name

            if output_path.exists() and arg == "--missing":
                skipped += 1
                continue

            if process_article(article, force=(arg == "--all")):
                success += 1
            else:
                failed += 1

        print(f"\n{'='*50}")
        print(f"✓ Générées: {success} | ⏭ Existantes: {skipped} | ❌ Échecs: {failed}")
    else:
        # Traiter un seul article
        process_article(arg, force=force)

if __name__ == "__main__":
    main()
