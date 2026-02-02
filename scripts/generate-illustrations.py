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
    "epstein-files-france-silence-mediatique": "Giant pile of declassified documents and folders with TOP SECRET stamps, French tricolor flag draped over part of them hiding content, mainstream TV cameras pointed away from the pile toward empty podium, Twitter bird logo illuminating the hidden documents with spotlight, Eiffel Tower and Statue of Liberty in background representing France-USA connection, journalists with blindfolds walking past, lone citizen on smartphone discovering truth, contrast between official silence and social media revelation",

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

    # Relations et couples
    "pourquoi-on-narrive-plus-a-etre-en-couple": "Two lonely silhouettes separated by wall of glowing smartphone screens with dating app profiles, paradox of choice, heart symbols floating but never connecting, urban apartment windows with solitary figures, broken wedding rings on ground, modern loneliness despite infinite connections",

    # Magie et influence invisible
    "la-magie-existe-t-elle-vraiment": "Surreal scene of invisible forces manipulating reality: giant translucent hands made of perfume mist reaching down from above to move chess pieces that are tiny humans in a casino, words floating as glowing runes with visible power emanating from them, a figure in business suit casting long shadow shaped like ancient wizard with staff, brain with visible neural pathways being touched by feather of suggestion, mirror showing different reality than what stands before it, storyteller weaving golden threads that become chains around listeners, all bathed in mystical purple and gold light suggesting hidden influence, optical illusions and impossible geometry, the seen and unseen worlds overlapping",

    # Parentalité et timing
    "le-bon-moment-pour-avoir-des-enfants": "Surreal hourglass where the sand is made of tiny baby cribs and rattles falling from top to bottom, a young couple in their 20s looking carefree at the top near full sand, same couple aged in their late 30s desperately reaching for the falling sand at the bottom with almost no sand left, biological clock face visible through the glass with hands spinning fast, calendar pages flying around, career ladder and apartment keys floating in the background competing for attention, warm nostalgic sepia tones at top transitioning to cold blue urgent tones at bottom, time running out visualization",

    # Égalité de genre et paradoxes
    "egalite-femmes-hommes-paradoxe-liberte": "Split scene showing paradox of choice: left side depicts women in modest professional attire working enthusiastically at engineering desks with circuit boards and robot arms in a developing country office with economic necessity symbols like coins and job security icons; right side shows Nordic women in casual clothes choosing between multiple colorful doors labeled with different career paths like art, teaching, nursing, business, with an empty engineering door in background; giant compass in center pointing different directions for each side; world map with arrows showing inverse correlation; freedom bird with open wings above Nordic side but women walking away from technical careers; warm earth tones on left, cool Scandinavian blues on right",

    # Alimentation et éthique animale
    "vegetarisme-veganisme-sauve-t-il-vraiment-des-animaux": "Surreal balance scale in the center: left pan holds ghostly transparent farm animals (cows, chickens, pigs) that are fading/never-born, right pan holds vibrant growing vegetables with tiny field mice running away to safety; in background, split scene showing industrial chicken factory on one side with endless identical birds, pastoral heritage farm with diverse rare breeds on other side threatened by extinction; giant calculator floating above showing '105 animals/year' with question marks; farmer hands holding seeds that sprout into both vegetables AND small heritage piglet simultaneously; philosophical question marks made of grain stalks; warm earthy greens meeting cold industrial greys",

    # Culture victimaire vs mérite
    "victime-ou-vainqueur-rapport-reussite": "Split scene with dramatic diagonal divide: left side shows figure crowned with thorns of victimhood, sitting on pedestal of grievances with microphones pointed at them, surrounded by sympathy and attention; right side shows figure climbing mountain of achievement alone, reaching for golden star at peak but facing skeptical looks from below; in center, balance scale weighing tears versus trophies, dramatically tipped; map of world with France colored in dark pessimistic blue while USA glows with optimistic gold; three symbolic figures representing honor culture (warrior with sword), dignity culture (stoic philosopher), and victimhood culture (person appealing to authority figure above); 90% statistic floating ominously; cultural values clash visualization",

    # Contrôle étatique de l'agriculture
    "controle-agriculture-ce-que-dit-lhistoire": "Haunting agricultural landscape divided into four quadrants representing different eras of state control: top-left shows Soviet collective farm with endless identical wheat fields under watchful eye in sky and starving Ukrainian peasants as ghostly figures; top-right shows Chinese Great Leap Forward with backyard furnaces melting farming tools while crops rot in fields; bottom-left shows Zimbabwean white farm being seized with tractors burning and land going fallow; bottom-right shows French farmer drowning in paperwork with EU stars forming a cage above, tractor with protest signs in background; central figure is weathered farmer's hand holding soil that's turning to dust; ominous bureaucratic stamps and regulations floating like storm clouds; warm earth tones corrupted by cold authoritarian greys",

    # Science et évolution
    "chiens-descendent-tous-loup": "Majestic grey wolf standing on snowy mountain peak under moonlight, its silhouette morphing and fragmenting into multiple dog breeds cascading down the mountainside like waterfall: tiny chihuahua, massive great dane, fluffy pomeranian, sleek greyhound, wrinkly shar-pei, all connected by glowing DNA helix strands, prehistoric ice age landscape in background with mammoth silhouettes, 40000 years timeline spiraling around the scene, wolf and chihuahua facing each other in foreground with 99.8% DNA connection visualized as golden thread between them, evolutionary tree branches extending from single wolf ancestor, warm amber tones for ancient past meeting cool blue for modern breeds",

    # Pyramide de Maslow et modernité
    "monde-moderne-redescente-pyramide-maslow": "Surreal crumbling pyramid floating in void, five distinct layers each showing different state: bottom layer (physiological) is solid but dependent on fragile electrical cables and supply chains; second layer (security) shows anxious figures on unstable employment contracts and flickering job titles; third layer (belonging) is most damaged with isolated figures holding smartphones showing 500 friends but sitting alone in empty rooms, cracked and falling apart; fourth layer (esteem) shows person desperately reaching for floating like buttons and follower counts that keep moving away; top layer (self-actualization) is foggy and unreachable with too many doors leading nowhere, paralysis of infinite choice; overall atmosphere of instability despite material abundance, golden cage aesthetic, modern loneliness visualization",

    # Madame Irma - Prédictions
    "jumeau-numerique-terre-simuler-avenir": "Massive holographic Earth floating in futuristic control room, translucent blue digital grid covering the planet surface, data streams flowing like rivers across continents, scientists in white coats monitoring multiple screens showing weather patterns and economic graphs, a butterfly with fractal wings symbolizing chaos theory in foreground, European Space Agency and Nvidia logos subtly visible, supercomputers with blinking lights lining the walls, split vision showing Earth simulation versus unpredictable human silhouettes walking in random directions, crystal ball cracked revealing circuit boards inside, prediction vs chaos visualization",

    "ukraine-2026-quatre-scenarios-consequences-france": "Dramatic geopolitical crossroads visualization: giant four-way road intersection in stormy sky with each path leading to different destination visible in distance; first path glows red leading to burning ruins and Russian tanks advancing over collapsed Ukrainian defenses; second path glows orange leading to frozen battlefield with soldiers in trenches covered in ice and snow, endless stalemate; third path glows yellow leading to fragile ceasefire line with UN peacekeepers and cracked ice beneath their feet, Korean DMZ style barrier; fourth path glows green leading to reconstruction cranes and business towers rising over peaceful landscape; at center intersection stands Marianne figure representing France holding scales weighing Thales and Dassault weapons on one side, euro coins for reconstruction on other; French tricolor flag flying above caught between NATO stars and EU stars in turbulent wind; Eiffel Tower visible on horizon watching the crossroads; clock showing 2026 floating above; warm amber for hope paths, cold blue for conflict paths, dramatic chiaroscuro lighting, strategic decision moment visualization",

    # Quizz interactifs
    "miroir-pensee": "Solitary figure standing before giant ornate mirror in surreal dreamscape, but the reflection shows multiple transparent versions of the same person each controlled by different puppet strings: one by TV screens, one by social media icons, one by crowd of identical grey figures, one by authority figure in suit; the real person holds scissors contemplating cutting the strings; thought bubbles around head contain question marks and broken chains; soft ethereal light emanating from the mirror suggesting self-discovery; philosophical introspection visualization, free will versus conditioning",

    "miroir-croyances": "Giant translucent human head seen from inside, filled with floating symbols from different belief systems orbiting like planets: Christian cross, Buddhist wheel, Islamic crescent, Hindu om, scientific atom, dollar sign, hammer and sickle, scales of justice, all interconnected by glowing threads; some symbols are bright and conscious, others dim and hidden in shadows representing unconscious beliefs; person sitting in meditation pose at center unaware of the constellation around them; stained glass window aesthetic with warm amber light, invisible influences visualization, philosophical archaeology of the mind",

    # Environnement - Méthane bovin
    "methane-bovin-faut-il-reduire-cheptel": "Pastoral French countryside with peaceful cows grazing on lush green prairie, but scene is split by dramatic diagonal: one side shows healthy ecosystem with carbon being absorbed into rich soil beneath grass roots visualized as glowing green tendrils, birds and biodiversity thriving; other side shows ghostly transparent cows fading away while cargo ships arrive on horizon carrying Brazilian beef with smoke trails and tiny burning Amazon trees visible in distance; giant balance scale in sky weighing a French cow against a globe showing 0.05% in small text; methane molecule CH4 floating but transforming into CO2 then being reabsorbed by grass in circular arrow pattern showing 12-year cycle; Cour des comptes report floating like ominous decree from above; French farmer looking up questioning the logic; warm pastoral greens versus cold industrial import greys",

    # Santé - Vaccins ARNm grippe
    "vaccins-arnm-grippe-ce-que-dit-la-science": "Split laboratory scene showing mRNA technology transformation: left side displays traditional flu vaccine production with eggs in incubators and slow calendar pages turning; right side shows futuristic mRNA synthesis with glowing lipid nanoparticles floating like tiny golden spheres around a double helix structure; central figure is a scientist holding both a classic syringe and a modern one with mRNA ribbon design; microscope view insets showing virus particles with spike proteins being targeted; floating data charts comparing efficacy percentages; subtle question marks made of molecular structures hovering above; peer-reviewed journal pages floating like sacred scrolls; balance scale weighing innovation against uncertainty; warm amber scientific glow meeting cool analytical blue",

    # Histoire - Régimes politiques français
    "quel-regime-politique-plus-stable-prospere-france": "Surreal museum of French political history: giant circular timeline spiraling through space showing 12 distinct French regimes as floating islands connected by bridges, each island with characteristic architecture: revolutionary barricades for 1789, imperial palace for Napoleon, austere parliament for IIIe République with 104 tiny chairs constantly shuffling, modernist Élysée for Ve République; in center of spiral a giant hourglass with constitutions as sand grains flowing through, 15 grains total; ghostly figures of de Gaulle Mitterrand and others watching from above; economic growth chart floating like a river between the islands peaking during Trente Glorieuses section; contrast between political chaos above and administrative continuity below shown as stable bedrock with prefects and bureaucrats maintaining order regardless of regime changes; warm sepia tones for older regimes transitioning to cool blues for modern era",

    # Politique comparée internationale
    "tous-socialistes-echiquier-politique-francais": "A French worker in blue overalls relaxing on a beach chair with umbrella holding a vacation calendar showing 5 weeks, while an American worker in suit looks confused and exhausted standing next to him with no chair; behind them a giant thermometer-style bar chart showing tax rates with France at top glowing warm red and USA at bottom in cold blue; Eiffel Tower in background on French side, Statue of Liberty on American side; simple clean composition, warm sunny atmosphere on French side contrasting with grey overcast on American side",

    # Économie - Libéralisme et confusions
    "liberalisme-capitalisme-neoliberalisme-demeler-confusions": "Surreal philosophical landscape with three distinct floating islands connected by bridges: first island shows Enlightenment philosophers Locke Voltaire Montesquieu around a glowing Declaration of Rights document representing political liberalism; second island shows industrial revolution factory with gears and Adam Smith figure representing economic capitalism; third island shows Reagan and Thatcher figures on Wall Street trading floor with golden bull statue representing neoliberalism; a confused French citizen at center crossroads holding a compass that spins wildly unable to choose direction; the three concepts visually distinct yet connected by thin golden threads; question marks floating in sky; warm amber tones for Enlightenment section, industrial grey for capitalism, cold neon blue for neoliberalism; conceptual clarity versus French confusion visualization",

    # Cinéma et culture - Avatar et colonialisme inversé
    "avatar-colonialisme-inverse-bon-sauvage": "Surreal scene of Western man transforming into tall blue alien Na'vi figure, half human in military gear half indigenous alien with tribal paint and braid; giant puppet strings descending from Hollywood camera in sky controlling both figures; lush alien bioluminescent forest of Pandora on right side glowing with mystical green and blue, industrial military base with smoke on left side; noble savage trope visualized as idealized Na'vi on pedestal being admired by kneeling Western figure; in background tribal indigenous people from Earth (Amazonian, Native American) shown as transparent ghostly figures being ignored; giant mirror in center reflecting distorted self-image; colonial guilt transformed into entertainment; Moebius style clean lines warm amber meeting alien blues and greens",

    # Économie - Retraites et fraude fiscale
    "retraites-le-vrai-trou-est-ailleurs": "Dramatic balance scale scene: on one side a tiny thimble labeled 'Deficit Retraites 6 Md' barely weighing anything; on other side a massive overflowing treasure chest labeled 'Fraude Fiscale 100 Md' with gold coins spilling out and being caught by wealthy figures in top hats; in foreground exhausted French worker pushing retirement age clock from 62 to 64 uphill like Sisyphus; in background luxury yachts and private jets flying to tax haven island with palm trees shaped like euro signs; giant magnifying glass from above examining the worker while deliberately avoiding the treasure chest; Marianne figure blindfolded holding broken scales; COR report papers floating like fallen leaves; warm amber for workers and cold gold for wealthy; social injustice and fiscal imbalance visualization",

    # Technologie - RAM et oligopole mémoire
    "ram-prix-explosion-qui-profite": "Detailed close-up of a DDR5 RAM stick as the central focus, green PCB circuit board with black memory chips and golden contact pins clearly visible; the RAM stick is cracked in half with golden coins and dollar bills spilling out from the break; behind it looms a massive shadowy AI data center with glowing server racks consuming smaller RAM sticks like a hungry beast; three corporate hands in business suits reaching from above fighting over the RAM stick; price tag attached showing crossed out 100 dollars replaced by 500 dollars; small home computer user in corner looking up with empty wallet; clean technical illustration style with warm amber lighting on RAM stick contrasting with cold blue corporate shadows",

    # France - Souveraineté et déclin
    "dernieres-decisions-souveraines-france": "Majestic Marianne figure standing at crossroads of history, one path behind her glows golden with nuclear mushroom cloud transforming into power plant, Concorde and Ariane rocket soaring, TGV speeding past Eiffel Tower, all symbols of past French greatness; the other path ahead descends into fog with sold-for-sale signs on factories, OTAN stars replacing French flag stars one by one, African map crumbling away, Euro symbol crushing the Franc; she holds broken scepter in one hand and EU passport in other; 2003 date floating above like last beacon of light, then darkness after; Charles de Gaulle ghost fading in background watching with disappointment; warm amber tones for glorious past transitioning to cold grey for present decline; sovereignty lost visualization, melancholic but dignified",

    # France - Souveraineté et paradoxe Trump
    "france-souveraine-illusion-ou-realite": "French TV studio with journalists and pundits laughing and pointing at caricature of Trump on screen while below them invisible puppet strings descend from American eagle clutching dollar sign and NATO star; the studio itself sits on tiny French map that floats helplessly in vast ocean dominated by massive USA landmass; in foreground French citizen watching TV distracted while behind them data cables flow from their home to American tech company logos (GAFAM), factory labeled Alstom being carried away by GE, and euro coins flowing into DOJ building; carousel of news headlines spinning (COVID, Ukraine, climate, bedbugs) creating smoke screen hiding the structural dependencies; Marianne figure trying to speak but microphone cord leads to Washington; warm amber TV glow contrasting with cold blue reality of dependence; comfortable illusion vs uncomfortable truth visualization",
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
    """Génère une image avec Google Gemini Imagen 4.0 (nouveau SDK)"""

    if not GOOGLE_API_KEY:
        return None  # Pas de clé, on skip

    try:
        # Importer le nouveau SDK google-genai
        from google import genai
        from google.genai import types

        print(f"  → Tentative avec Gemini Imagen 4.0...")

        # Configurer le client
        client = genai.Client(api_key=GOOGLE_API_KEY)

        # Générer l'image avec Imagen 4.0
        response = client.models.generate_images(
            model='imagen-4.0-generate-001',
            prompt=prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="16:9"
            )
        )

        if response.generated_images:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            response.generated_images[0].image.save(str(output_path))
            print(f"  ✓ Image sauvegardée: {output_path.name}")
            return True

        return None  # Pas d'image générée, essayer le fallback

    except ImportError:
        print("  ⚠ SDK google-genai non installé. Installez avec: pip install google-genai")
        return None
    except Exception as e:
        print(f"  ⚠ Erreur Gemini: {e}")
        return None  # Fallback sur Pollinations

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
