/**
 * Réveil Douceur - Le Miroir des Croyances Invisibles
 * Quiz introspectif : Quelle philosophie vous habite sans le savoir ?
 */

(function() {
  'use strict';

  // ========================================
  // Configuration des systèmes de valeurs
  // ========================================

  // RELIGIONS ET SPIRITUALITÉS
  const RELIGIONS = {
    christianisme: {
      id: 'christianisme',
      label: 'Christianisme',
      shortLabel: 'Chrétien',
      color: '#8B5CF6', // Violet
      description: 'Valeurs de charité, de rédemption, de culpabilité et de salut. Vision linéaire du temps, importance du pardon et de l\'amour du prochain.',
      concepts: ['péché originel', 'rédemption', 'charité', 'humilité', 'vie éternelle', 'pardon'],
      livres: [
        { titre: 'Les Évangiles', auteur: '', note: 'Les textes fondateurs (Matthieu, Marc, Luc, Jean)' },
        { titre: 'Les Confessions', auteur: 'Saint Augustin', note: 'Autobiographie spirituelle fondatrice' },
        { titre: 'Erta Cavé - L\'histoire des religions', auteur: 'Frédéric Lenoir', note: 'Approche accessible et comparative' }
      ]
    },
    islam: {
      id: 'islam',
      label: 'Islam',
      shortLabel: 'Islam',
      color: '#10B981', // Vert
      description: 'Soumission à un ordre divin, importance de la communauté (Oumma), justice sociale, équilibre entre vie spirituelle et matérielle.',
      concepts: ['soumission', 'communauté', 'justice', 'aumône obligatoire', 'destin', 'licite/illicite'],
      livres: [
        { titre: 'Le Coran', auteur: '', note: 'Texte fondateur, essayer une traduction commentée (Hamidullah, Berque)' },
        { titre: 'La Vie du Prophète Muhammad', auteur: 'Ibn Ishaq / Martin Lings', note: 'Biographie classique' },
        { titre: 'L\'Islam expliqué aux enfants (et aux adultes)', auteur: 'Tahar Ben Jelloun', note: 'Introduction accessible' }
      ]
    },
    judaisme: {
      id: 'judaisme',
      label: 'Judaïsme',
      shortLabel: 'Judaïsme',
      color: '#3B82F6', // Bleu
      description: 'Alliance et élection, importance de la Loi et de l\'étude, réparation du monde (Tikkoun Olam), mémoire et transmission.',
      concepts: ['alliance', 'loi', 'étude', 'mémoire', 'justice', 'réparation du monde'],
      livres: [
        { titre: 'La Torah', auteur: '', note: 'Les cinq premiers livres de la Bible (Pentateuque)' },
        { titre: 'Pirké Avot (Éthique des Pères)', auteur: '', note: 'Sagesse rabbinique accessible' },
        { titre: 'La Kabbale', auteur: 'Charles Mopsik', note: 'Introduction à la mystique juive' },
        { titre: 'Le Talmud', auteur: 'Adin Steinsaltz', note: 'Version commentée et accessible' }
      ]
    },
    bouddhisme: {
      id: 'bouddhisme',
      label: 'Bouddhisme',
      shortLabel: 'Bouddhisme',
      color: '#F59E0B', // Orange
      description: 'Détachement du désir, impermanence, compassion universelle, recherche de l\'éveil par la méditation et la sagesse.',
      concepts: ['détachement', 'impermanence', 'compassion', 'éveil', 'karma', 'souffrance'],
      livres: [
        { titre: 'Dhammapada', auteur: '', note: 'Paroles du Bouddha, texte court et accessible' },
        { titre: 'L\'Art du bonheur', auteur: 'Dalaï Lama', note: 'Introduction pratique et contemporaine' },
        { titre: 'Siddhartha', auteur: 'Hermann Hesse', note: 'Roman initiatique inspiré du bouddhisme' },
        { titre: 'Le Cœur de la méditation', auteur: 'Thich Nhat Hanh', note: 'Pratique de la pleine conscience' }
      ]
    },
    hindouisme: {
      id: 'hindouisme',
      label: 'Hindouisme',
      shortLabel: 'Hindou',
      color: '#EC4899', // Rose
      description: 'Dharma (devoir), karma et réincarnation, diversité des voies spirituelles, sacralité de la nature et du cosmos.',
      concepts: ['dharma', 'karma', 'réincarnation', 'non-violence', 'unité cosmique', 'cycles'],
      livres: [
        { titre: 'Bhagavad-Gita', auteur: '', note: 'Dialogue philosophique essentiel (trad. Alain Porte)' },
        { titre: 'Les Upanishads', auteur: '', note: 'Textes métaphysiques fondateurs' },
        { titre: 'Autobiographie d\'un Yogi', auteur: 'Paramahansa Yogananda', note: 'Récit spirituel accessible' },
        { titre: 'L\'Hindouisme', auteur: 'Louis Renou', note: 'Introduction académique complète' }
      ]
    }
  };

  // IDÉOLOGIES SÉCULIÈRES
  const IDEOLOGIES = {
    capitalisme: {
      id: 'capitalisme',
      label: 'Capitalisme libéral',
      shortLabel: 'Capitalisme',
      color: '#EF4444', // Rouge
      description: 'Valorisation du mérite individuel, propriété privée, compétition comme moteur du progrès, liberté économique.',
      concepts: ['mérite', 'propriété', 'compétition', 'croissance', 'liberté individuelle', 'marché'],
      heritageReligieux: 'Le capitalisme moderne est né de l\'éthique protestante du travail (Max Weber) : la réussite économique était vue comme un signe de l\'élection divine.',
      livres: [
        { titre: 'L\'Éthique protestante et l\'esprit du capitalisme', auteur: 'Max Weber', note: 'Analyse des racines religieuses du capitalisme' },
        { titre: 'La Richesse des nations', auteur: 'Adam Smith', note: 'Texte fondateur de l\'économie libérale' },
        { titre: 'Capitalisme et Liberté', auteur: 'Milton Friedman', note: 'Défense du libéralisme économique' }
      ]
    },
    socialisme: {
      id: 'socialisme',
      label: 'Socialisme',
      shortLabel: 'Socialisme',
      color: '#DC2626', // Rouge foncé
      description: 'Égalité, solidarité collective, critique de l\'accumulation, justice redistributive, bien commun.',
      concepts: ['égalité', 'solidarité', 'redistribution', 'bien commun', 'classe', 'émancipation'],
      heritageReligieux: 'Le socialisme reprend la charité chrétienne sécularisée : partage des biens (comme chez les premiers chrétiens), prophétisme messianique d\'un monde juste à venir.',
      livres: [
        { titre: 'Le Capital', auteur: 'Karl Marx', note: 'Critique fondatrice du capitalisme (Livre I)' },
        { titre: 'La Société du spectacle', auteur: 'Guy Debord', note: 'Critique radicale de la société de consommation' },
        { titre: 'L\'Entraide', auteur: 'Pierre Kropotkine', note: 'Alternative anarchiste au darwinisme social' }
      ]
    },
    humanisme: {
      id: 'humanisme',
      label: 'Humanisme des Lumières',
      shortLabel: 'Humanisme',
      color: '#6366F1', // Indigo
      description: 'Raison, progrès, droits universels, dignité humaine, éducation comme émancipation.',
      concepts: ['raison', 'progrès', 'droits', 'dignité', 'universalisme', 'éducation'],
      heritageReligieux: 'L\'humanisme hérite du christianisme l\'idée que l\'homme est créé "à l\'image de Dieu" (Imago Dei), donc digne et égal. Les droits de l\'homme sont un messianisme sécularisé.',
      livres: [
        { titre: 'Qu\'est-ce que les Lumières ?', auteur: 'Emmanuel Kant', note: 'Court texte fondateur' },
        { titre: 'Discours de la méthode', auteur: 'René Descartes', note: 'Fondement de la raison moderne' },
        { titre: 'De la dignité de l\'homme', auteur: 'Pic de la Mirandole', note: 'Manifeste humaniste de la Renaissance' }
      ]
    },
    ecologisme: {
      id: 'ecologisme',
      label: 'Écologisme profond',
      shortLabel: 'Écologisme',
      color: '#22C55E', // Vert vif
      description: 'Sacralité de la nature, interdépendance, critique du progrès, sobriété, responsabilité intergénérationnelle.',
      concepts: ['nature sacrée', 'interdépendance', 'sobriété', 'cycles', 'limites', 'harmonie'],
      heritageReligieux: 'L\'écologisme profond sacralise la nature comme les religions panthéistes et animistes. Il emprunte aussi au franciscanisme (fraternité avec les créatures) et aux spiritualités orientales (non-dualité).',
      livres: [
        { titre: 'Printemps silencieux', auteur: 'Rachel Carson', note: 'Livre fondateur de l\'écologie moderne' },
        { titre: 'Les Racines du ciel', auteur: 'Romain Gary', note: 'Roman humaniste et écologique' },
        { titre: 'Écologie profonde', auteur: 'Arne Næss', note: 'Philosophie de l\'écologie radicale' }
      ]
    },
    transhumanisme: {
      id: 'transhumanisme',
      label: 'Transhumanisme',
      shortLabel: 'Transhumanisme',
      color: '#06B6D4', // Cyan
      description: 'Dépassement des limites biologiques, foi dans la technologie, immortalité comme horizon, amélioration de l\'humain.',
      concepts: ['amélioration', 'immortalité', 'technologie', 'dépassement', 'évolution dirigée', 'singularité'],
      heritageReligieux: 'Le transhumanisme est une eschatologie technologique : il reprend la promesse chrétienne de vie éternelle, le gnosticisme (le corps comme prison à dépasser), et le millénarisme (la Singularité comme Paradis technologique).',
      livres: [
        { titre: 'La Singularité est proche', auteur: 'Ray Kurzweil', note: 'Manifeste transhumaniste' },
        { titre: 'Homo Deus', auteur: 'Yuval Noah Harari', note: 'Analyse critique du transhumanisme' },
        { titre: 'Nous sommes des dieux', auteur: 'Stewart Brand', note: 'Vision optimiste de la technologie' }
      ]
    },
    stoicisme: {
      id: 'stoicisme',
      label: 'Stoïcisme',
      shortLabel: 'Stoïcisme',
      color: '#78716C', // Gris pierre
      description: 'Acceptation de ce qui ne dépend pas de nous, maîtrise de soi, vertu comme seul bien, cosmopolitisme.',
      concepts: ['acceptation', 'maîtrise de soi', 'vertu', 'devoir', 'nature', 'raison'],
      heritageReligieux: 'Le stoïcisme a profondément influencé le christianisme : saint Paul et saint Augustin en ont repris des concepts clés. La notion de "providence" et l\'idée d\'accepter la volonté divine viennent en partie du stoïcisme.',
      livres: [
        { titre: 'Manuel', auteur: 'Épictète', note: 'Court guide pratique de sagesse stoïcienne' },
        { titre: 'Pensées pour moi-même', auteur: 'Marc Aurèle', note: 'Journal intime d\'un empereur philosophe' },
        { titre: 'Lettres à Lucilius', auteur: 'Sénèque', note: 'Sagesse pratique appliquée à la vie quotidienne' }
      ]
    }
  };

  // Tous les systèmes combinés pour le scoring
  const SYSTEMES = { ...RELIGIONS, ...IDEOLOGIES };

  // ========================================
  // Questions du quiz (comportementales)
  // ========================================
  const QUESTIONS = [
    // === BLOC 1 : Rapport au travail et à l'argent ===
    {
      id: 'travail1',
      texte: 'Pour vous, le travail est avant tout...',
      categorie: 'travail',
      reponses: [
        {
          id: 'a',
          texte: 'Un moyen de subvenir à ses besoins, rien de plus',
          scores: { bouddhisme: 2, stoicisme: 1 }
        },
        {
          id: 'b',
          texte: 'Une vocation, une façon de se réaliser et de prouver sa valeur',
          scores: { capitalisme: 2, christianisme: 1 }
        },
        {
          id: 'c',
          texte: 'Une contribution au bien commun et à la société',
          scores: { socialisme: 2, islam: 1, judaisme: 1 }
        },
        {
          id: 'd',
          texte: 'Un devoir, une responsabilité qu\'on accomplit avec discipline',
          scores: { stoicisme: 2, hindouisme: 1, islam: 1 }
        }
      ]
    },
    {
      id: 'argent1',
      texte: 'Face à une rentrée d\'argent inattendue, votre premier réflexe serait de...',
      categorie: 'argent',
      reponses: [
        {
          id: 'a',
          texte: 'L\'investir pour le faire fructifier',
          scores: { capitalisme: 2 }
        },
        {
          id: 'b',
          texte: 'En donner une partie à ceux qui en ont besoin',
          scores: { christianisme: 2, islam: 2, socialisme: 1 }
        },
        {
          id: 'c',
          texte: 'Le mettre de côté pour l\'avenir de ma famille',
          scores: { judaisme: 2, hindouisme: 1 }
        },
        {
          id: 'd',
          texte: 'Me demander si j\'en ai vraiment besoin',
          scores: { bouddhisme: 2, ecologisme: 1, stoicisme: 1 }
        }
      ]
    },
    {
      id: 'reussite1',
      texte: 'Quelqu\'un de "réussi" dans la vie, c\'est quelqu\'un qui...',
      categorie: 'travail',
      reponses: [
        {
          id: 'a',
          texte: 'A atteint ses objectifs et construit quelque chose',
          scores: { capitalisme: 2, humanisme: 1 }
        },
        {
          id: 'b',
          texte: 'Est en paix avec lui-même et les autres',
          scores: { bouddhisme: 2, stoicisme: 2 }
        },
        {
          id: 'c',
          texte: 'A bien rempli ses devoirs envers sa famille et sa communauté',
          scores: { hindouisme: 2, islam: 1, judaisme: 1 }
        },
        {
          id: 'd',
          texte: 'A aidé les autres et laissé le monde meilleur',
          scores: { christianisme: 2, socialisme: 1, ecologisme: 1 }
        }
      ]
    },

    // === BLOC 2 : Rapport à la souffrance et aux épreuves ===
    {
      id: 'souffrance1',
      texte: 'Face à une épreuve difficile (maladie, perte, échec), vous pensez spontanément...',
      categorie: 'souffrance',
      reponses: [
        {
          id: 'a',
          texte: '"C\'est une épreuve qui va me rendre plus fort/meilleur"',
          scores: { christianisme: 2, stoicisme: 1 }
        },
        {
          id: 'b',
          texte: '"C\'est la vie, il faut l\'accepter et continuer"',
          scores: { bouddhisme: 2, stoicisme: 2, islam: 1 }
        },
        {
          id: 'c',
          texte: '"C\'est injuste, il faut lutter contre"',
          scores: { humanisme: 2, socialisme: 1 }
        },
        {
          id: 'd',
          texte: '"Il y a peut-être une raison que je ne comprends pas encore"',
          scores: { hindouisme: 2, judaisme: 1, islam: 1 }
        }
      ]
    },
    {
      id: 'souffrance2',
      texte: 'La souffrance dans le monde vous semble...',
      categorie: 'souffrance',
      reponses: [
        {
          id: 'a',
          texte: 'Inacceptable, il faut tout faire pour l\'éliminer',
          scores: { humanisme: 2, transhumanisme: 2, socialisme: 1 }
        },
        {
          id: 'b',
          texte: 'Inévitable, mais on peut apprendre à la transcender',
          scores: { bouddhisme: 2, stoicisme: 2 }
        },
        {
          id: 'c',
          texte: 'Mystérieuse, elle a peut-être un sens qu\'on ne saisit pas',
          scores: { christianisme: 2, hindouisme: 1, judaisme: 1 }
        },
        {
          id: 'd',
          texte: 'Souvent causée par nos propres actions (individuelles ou collectives)',
          scores: { ecologisme: 2, islam: 1, hindouisme: 1 }
        }
      ]
    },
    {
      id: 'culpabilite1',
      texte: 'Quand vous faites une erreur qui blesse quelqu\'un, vous ressentez surtout...',
      categorie: 'souffrance',
      reponses: [
        {
          id: 'a',
          texte: 'De la culpabilité, le besoin d\'être pardonné',
          scores: { christianisme: 2, judaisme: 1 }
        },
        {
          id: 'b',
          texte: 'De la honte face au groupe ou à la famille',
          scores: { islam: 1, hindouisme: 2, judaisme: 1 }
        },
        {
          id: 'c',
          texte: 'Le besoin de réparer concrètement, d\'agir',
          scores: { judaisme: 2, socialisme: 1, humanisme: 1 }
        },
        {
          id: 'd',
          texte: 'Une leçon à méditer pour ne pas recommencer',
          scores: { bouddhisme: 2, stoicisme: 2 }
        }
      ]
    },

    // === BLOC 3 : Rapport au temps et à la mort ===
    {
      id: 'temps1',
      texte: 'L\'histoire de l\'humanité, selon vous, va globalement vers...',
      categorie: 'temps',
      reponses: [
        {
          id: 'a',
          texte: 'Le progrès, l\'amélioration continue',
          scores: { humanisme: 2, transhumanisme: 2, capitalisme: 1 }
        },
        {
          id: 'b',
          texte: 'Un déclin, on s\'éloigne d\'un âge d\'or passé',
          scores: { ecologisme: 1, hindouisme: 1 }
        },
        {
          id: 'c',
          texte: 'Des cycles, des hauts et des bas qui se répètent',
          scores: { hindouisme: 2, bouddhisme: 1, stoicisme: 1 }
        },
        {
          id: 'd',
          texte: 'Vers un dénouement final (catastrophe ou accomplissement)',
          scores: { christianisme: 2, islam: 1, judaisme: 1 }
        }
      ]
    },
    {
      id: 'mort1',
      texte: 'Concernant la mort, vous pensez plutôt que...',
      categorie: 'temps',
      reponses: [
        {
          id: 'a',
          texte: 'C\'est la fin définitive, il n\'y a rien après',
          scores: { stoicisme: 1, humanisme: 1 }
        },
        {
          id: 'b',
          texte: 'L\'âme continue sous une forme ou une autre',
          scores: { christianisme: 2, islam: 2, judaisme: 1 }
        },
        {
          id: 'c',
          texte: 'On se réincarne ou on se fond dans un tout',
          scores: { hindouisme: 2, bouddhisme: 2 }
        },
        {
          id: 'd',
          texte: 'La science pourrait un jour la vaincre',
          scores: { transhumanisme: 3 }
        }
      ]
    },
    {
      id: 'mort2',
      texte: 'Face à l\'idée de votre propre mort, vous ressentez surtout...',
      categorie: 'temps',
      reponses: [
        {
          id: 'a',
          texte: 'De l\'angoisse, c\'est difficile à accepter',
          scores: { humanisme: 1, transhumanisme: 1 }
        },
        {
          id: 'b',
          texte: 'De la sérénité, c\'est dans l\'ordre des choses',
          scores: { stoicisme: 2, bouddhisme: 2, islam: 1 }
        },
        {
          id: 'c',
          texte: 'L\'espoir d\'une continuité (paradis, autre vie...)',
          scores: { christianisme: 2, islam: 2, hindouisme: 1 }
        },
        {
          id: 'd',
          texte: 'Le souci de ce que je laisserai derrière moi',
          scores: { judaisme: 2, ecologisme: 1, socialisme: 1 }
        }
      ]
    },

    // === BLOC 4 : Rapport à l'individu et au groupe ===
    {
      id: 'groupe1',
      texte: 'Entre l\'individu et le groupe (famille, communauté, nation), qui devrait primer ?',
      categorie: 'groupe',
      reponses: [
        {
          id: 'a',
          texte: 'L\'individu, sa liberté est sacrée',
          scores: { capitalisme: 2, humanisme: 1, stoicisme: 1 }
        },
        {
          id: 'b',
          texte: 'Le groupe, l\'individu n\'existe que par lui',
          scores: { islam: 2, socialisme: 1, hindouisme: 1 }
        },
        {
          id: 'c',
          texte: 'Un équilibre, l\'individu a des devoirs envers le groupe',
          scores: { judaisme: 2, christianisme: 1, stoicisme: 1 }
        },
        {
          id: 'd',
          texte: 'Ni l\'un ni l\'autre, les deux sont des illusions',
          scores: { bouddhisme: 2 }
        }
      ]
    },
    {
      id: 'groupe2',
      texte: 'Votre sentiment d\'appartenance le plus fort va vers...',
      categorie: 'groupe',
      reponses: [
        {
          id: 'a',
          texte: 'Ma famille, mes proches',
          scores: { judaisme: 2, hindouisme: 1, islam: 1 }
        },
        {
          id: 'b',
          texte: 'Ma communauté (religieuse, culturelle, locale)',
          scores: { islam: 2, christianisme: 1 }
        },
        {
          id: 'c',
          texte: 'L\'humanité entière, sans distinction',
          scores: { humanisme: 2, bouddhisme: 1, stoicisme: 1 }
        },
        {
          id: 'd',
          texte: 'La nature, le vivant dans son ensemble',
          scores: { ecologisme: 2, hindouisme: 1, bouddhisme: 1 }
        }
      ]
    },
    {
      id: 'autorite1',
      texte: 'Face à une règle que vous trouvez injuste, vous...',
      categorie: 'groupe',
      reponses: [
        {
          id: 'a',
          texte: 'La respectez quand même, l\'ordre social est important',
          scores: { islam: 1, hindouisme: 2, stoicisme: 1 }
        },
        {
          id: 'b',
          texte: 'Cherchez à la changer par les voies légitimes',
          scores: { humanisme: 2, judaisme: 1 }
        },
        {
          id: 'c',
          texte: 'La transgressez si votre conscience vous y pousse',
          scores: { christianisme: 1, socialisme: 1 }
        },
        {
          id: 'd',
          texte: 'Vous en détachez intérieurement, elle ne vous atteint pas',
          scores: { bouddhisme: 2, stoicisme: 2 }
        }
      ]
    },

    // === BLOC 5 : Rapport à la nature et au corps ===
    {
      id: 'nature1',
      texte: 'La nature, pour vous, c\'est avant tout...',
      categorie: 'nature',
      reponses: [
        {
          id: 'a',
          texte: 'Une ressource à exploiter intelligemment',
          scores: { capitalisme: 2, humanisme: 1 }
        },
        {
          id: 'b',
          texte: 'Une création divine à respecter et protéger',
          scores: { christianisme: 1, islam: 2, judaisme: 1 }
        },
        {
          id: 'c',
          texte: 'Un tout sacré dont nous faisons partie',
          scores: { ecologisme: 2, hindouisme: 2, bouddhisme: 1 }
        },
        {
          id: 'd',
          texte: 'Un système à comprendre, améliorer, voire dépasser',
          scores: { transhumanisme: 2, humanisme: 1 }
        }
      ]
    },
    {
      id: 'corps1',
      texte: 'Votre corps, vous le considérez comme...',
      categorie: 'nature',
      reponses: [
        {
          id: 'a',
          texte: 'Un véhicule, un outil au service de l\'esprit',
          scores: { christianisme: 1, bouddhisme: 1, transhumanisme: 1 }
        },
        {
          id: 'b',
          texte: 'Un temple, quelque chose de sacré à respecter',
          scores: { islam: 2, hindouisme: 1, judaisme: 1 }
        },
        {
          id: 'c',
          texte: 'Une machine à optimiser et améliorer',
          scores: { transhumanisme: 2, capitalisme: 1 }
        },
        {
          id: 'd',
          texte: 'Une partie de la nature, soumis aux mêmes lois',
          scores: { stoicisme: 2, ecologisme: 1, bouddhisme: 1 }
        }
      ]
    },
    {
      id: 'plaisir1',
      texte: 'Le plaisir et le confort matériel sont pour vous...',
      categorie: 'nature',
      reponses: [
        {
          id: 'a',
          texte: 'Des objectifs légitimes, il faut profiter de la vie',
          scores: { capitalisme: 2, humanisme: 1 }
        },
        {
          id: 'b',
          texte: 'Des pièges qui nous éloignent de l\'essentiel',
          scores: { bouddhisme: 2, christianisme: 1, stoicisme: 1 }
        },
        {
          id: 'c',
          texte: 'Acceptables avec modération, dans un cadre',
          scores: { islam: 2, judaisme: 2, hindouisme: 1 }
        },
        {
          id: 'd',
          texte: 'À questionner : leur coût écologique/social est-il justifié ?',
          scores: { ecologisme: 2, socialisme: 1 }
        }
      ]
    },

    // === BLOC 6 : Rapport à la vérité et à la connaissance ===
    {
      id: 'verite1',
      texte: 'La vérité, selon vous, se trouve principalement dans...',
      categorie: 'verite',
      reponses: [
        {
          id: 'a',
          texte: 'La science et la raison',
          scores: { humanisme: 2, transhumanisme: 1, capitalisme: 1 }
        },
        {
          id: 'b',
          texte: 'Les textes sacrés et la tradition',
          scores: { islam: 2, judaisme: 2, christianisme: 1 }
        },
        {
          id: 'c',
          texte: 'L\'expérience intérieure et la méditation',
          scores: { bouddhisme: 2, hindouisme: 2 }
        },
        {
          id: 'd',
          texte: 'Il n\'y a pas de vérité absolue, que des perspectives',
          scores: { stoicisme: 1, ecologisme: 1 }
        }
      ]
    },
    {
      id: 'verite2',
      texte: 'Quand la science contredit une croyance répandue, vous pensez que...',
      categorie: 'verite',
      reponses: [
        {
          id: 'a',
          texte: 'La science a forcément raison',
          scores: { humanisme: 2, transhumanisme: 1 }
        },
        {
          id: 'b',
          texte: 'La croyance a peut-être accès à une vérité que la science ignore',
          scores: { christianisme: 1, hinduisme: 1, islam: 1, judaisme: 1 }
        },
        {
          id: 'c',
          texte: 'Il faut examiner les deux sans a priori',
          scores: { stoicisme: 2, bouddhisme: 1 }
        },
        {
          id: 'd',
          texte: 'La science n\'est pas neutre, elle a ses propres biais',
          scores: { ecologisme: 1, socialisme: 1 }
        }
      ]
    },

    // === BLOC 7 : Rapport à l'égalité et à la justice ===
    {
      id: 'egalite1',
      texte: 'Les inégalités entre les gens sont...',
      categorie: 'justice',
      reponses: [
        {
          id: 'a',
          texte: 'Naturelles et nécessaires, elles stimulent l\'effort',
          scores: { capitalisme: 2, hindouisme: 1 }
        },
        {
          id: 'b',
          texte: 'Injustes, il faut les réduire activement',
          scores: { socialisme: 2, christianisme: 1, humanisme: 1 }
        },
        {
          id: 'c',
          texte: 'Le résultat des actions passées (karma, mérite...)',
          scores: { hindouisme: 2, capitalisme: 1 }
        },
        {
          id: 'd',
          texte: 'Secondaires, l\'égalité spirituelle compte plus',
          scores: { bouddhisme: 2, christianisme: 1, islam: 1 }
        }
      ]
    },
    {
      id: 'justice1',
      texte: 'Un criminel devrait avant tout...',
      categorie: 'justice',
      reponses: [
        {
          id: 'a',
          texte: 'Être puni à la mesure de son acte',
          scores: { judaisme: 1, islam: 1 }
        },
        {
          id: 'b',
          texte: 'Être réhabilité et réintégré dans la société',
          scores: { humanisme: 2, socialisme: 1 }
        },
        {
          id: 'c',
          texte: 'Avoir l\'opportunité de se repentir et d\'être pardonné',
          scores: { christianisme: 2 }
        },
        {
          id: 'd',
          texte: 'Comprendre les conséquences de ses actes (sur lui et les autres)',
          scores: { bouddhisme: 2, stoicisme: 1, hindouisme: 1 }
        }
      ]
    },

    // === BLOC 8 : Questions de synthèse ===
    {
      id: 'synthese1',
      texte: 'Si vous deviez résumer ce qui donne du sens à votre vie, ce serait...',
      categorie: 'synthese',
      reponses: [
        {
          id: 'a',
          texte: 'Construire, créer, laisser une trace',
          scores: { capitalisme: 1, humanisme: 1, judaisme: 1 }
        },
        {
          id: 'b',
          texte: 'Aimer et être aimé, les relations humaines',
          scores: { christianisme: 2, humanisme: 1 }
        },
        {
          id: 'c',
          texte: 'Comprendre, apprendre, m\'éveiller',
          scores: { bouddhisme: 2, hindouisme: 1, judaisme: 1 }
        },
        {
          id: 'd',
          texte: 'Servir quelque chose de plus grand que moi',
          scores: { islam: 2, christianisme: 1, ecologisme: 1, socialisme: 1 }
        }
      ]
    },
    {
      id: 'synthese2',
      texte: 'Quelle phrase vous parle le plus ?',
      categorie: 'synthese',
      reponses: [
        {
          id: 'a',
          texte: '"Aide-toi et le ciel t\'aidera"',
          scores: { capitalisme: 2, christianisme: 1 }
        },
        {
          id: 'b',
          texte: '"Aimez-vous les uns les autres"',
          scores: { christianisme: 2, humanisme: 1 }
        },
        {
          id: 'c',
          texte: '"Connais-toi toi-même"',
          scores: { bouddhisme: 1, stoicisme: 2, humanisme: 1 }
        },
        {
          id: 'd',
          texte: '"Il n\'y a de force qu\'en Dieu" / "Se soumettre à l\'ordre du monde"',
          scores: { islam: 2, stoicisme: 1, hindouisme: 1 }
        }
      ]
    },
    {
      id: 'synthese3',
      texte: 'Ce qui vous effraie le plus dans le monde actuel...',
      categorie: 'synthese',
      reponses: [
        {
          id: 'a',
          texte: 'La perte des valeurs et des traditions',
          scores: { christianisme: 1, islam: 1, judaisme: 1, hindouisme: 1 }
        },
        {
          id: 'b',
          texte: 'Les inégalités et l\'injustice sociale',
          scores: { socialisme: 2, humanisme: 1 }
        },
        {
          id: 'c',
          texte: 'La destruction de la nature',
          scores: { ecologisme: 2, bouddhisme: 1 }
        },
        {
          id: 'd',
          texte: 'L\'atteinte aux libertés individuelles',
          scores: { capitalisme: 2, humanisme: 1 }
        }
      ]
    }
  ];

  // ========================================
  // Classe principale du Quiz
  // ========================================
  class MiroirCroyances {
    constructor(container) {
      this.container = container;
      this.scores = {};
      this.reponses = [];
      this.currentQuestionIndex = 0;

      // Initialiser tous les scores à 0
      Object.keys(SYSTEMES).forEach(key => {
        this.scores[key] = 0;
      });

      this.init();
    }

    init() {
      this.renderQuestion();
      this.bindEvents();
    }

    bindEvents() {
      this.container.addEventListener('click', (e) => {
        const answerBtn = e.target.closest('.miroir__answer');
        if (answerBtn && !answerBtn.disabled) {
          this.handleAnswer(answerBtn);
        }

        const restartBtn = e.target.closest('#miroir-restart');
        if (restartBtn) {
          this.restart();
        }
      });
    }

    getCurrentQuestion() {
      return QUESTIONS[this.currentQuestionIndex];
    }

    handleAnswer(answerBtn) {
      const question = this.getCurrentQuestion();
      const answerId = answerBtn.dataset.answer;
      const reponse = question.reponses.find(r => r.id === answerId);

      if (!reponse) return;

      // Enregistrer la réponse
      this.reponses.push({
        questionId: question.id,
        answerId: answerId,
        scores: reponse.scores
      });

      // Mettre à jour les scores
      for (const [systeme, score] of Object.entries(reponse.scores)) {
        if (this.scores[systeme] !== undefined) {
          this.scores[systeme] += score;
        }
      }

      // Animation de sélection
      const allAnswers = this.container.querySelectorAll('.miroir__answer');
      allAnswers.forEach(btn => {
        btn.disabled = true;
        if (btn === answerBtn) {
          btn.classList.add('miroir__answer--selected');
        }
      });

      // Passer à la question suivante
      setTimeout(() => {
        this.nextQuestion();
      }, 500);
    }

    nextQuestion() {
      this.currentQuestionIndex++;

      if (this.currentQuestionIndex < QUESTIONS.length) {
        this.renderQuestion();
      } else {
        this.showResults();
      }
    }

    getProgress() {
      return Math.round((this.currentQuestionIndex / QUESTIONS.length) * 100);
    }

    renderQuestion() {
      const question = this.getCurrentQuestion();
      if (!question) return;

      const progress = this.getProgress();

      const html = `
        <div class="miroir__progress">
          <div class="miroir__progress-bar">
            <div class="miroir__progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="miroir__progress-text">${this.currentQuestionIndex + 1} / ${QUESTIONS.length}</span>
        </div>

        <div class="miroir__question" data-question="${question.id}">
          <h2 class="miroir__question-text">${question.texte}</h2>
          ${question.note ? `<p class="miroir__question-note">${question.note}</p>` : ''}

          <div class="miroir__answers">
            ${question.reponses.map(r => `
              <button class="miroir__answer" data-answer="${r.id}">
                <span class="miroir__answer-text">${r.texte}</span>
              </button>
            `).join('')}
          </div>
        </div>
      `;

      this.container.innerHTML = html;

      // Animation d'entrée
      const questionEl = this.container.querySelector('.miroir__question');
      questionEl.style.opacity = '0';
      questionEl.style.transform = 'translateY(20px)';
      requestAnimationFrame(() => {
        questionEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        questionEl.style.opacity = '1';
        questionEl.style.transform = 'translateY(0)';
      });
    }

    calculateResults() {
      // Calculer les scores RELATIFS au sein de chaque catégorie
      // Cela évite d'avoir 100% dans plusieurs catégories

      const religionScores = {};
      const ideologieScores = {};

      // Calculer les totaux bruts par catégorie
      let totalReligionScore = 0;
      let totalIdeologieScore = 0;

      Object.keys(RELIGIONS).forEach(key => {
        totalReligionScore += this.scores[key] || 0;
      });

      Object.keys(IDEOLOGIES).forEach(key => {
        totalIdeologieScore += this.scores[key] || 0;
      });

      // Normaliser EN RELATIF dans chaque catégorie (les % s'additionnent à 100 dans chaque radar)
      Object.keys(RELIGIONS).forEach(key => {
        const rawScore = this.scores[key] || 0;
        religionScores[key] = totalReligionScore > 0
          ? Math.round((rawScore / totalReligionScore) * 100)
          : 0;
      });

      Object.keys(IDEOLOGIES).forEach(key => {
        const rawScore = this.scores[key] || 0;
        ideologieScores[key] = totalIdeologieScore > 0
          ? Math.round((rawScore / totalIdeologieScore) * 100)
          : 0;
      });

      // Scores combinés pour le top 3 (utiliser les scores bruts pour comparer)
      const allScores = { ...this.scores };

      // Trouver les dominants dans chaque catégorie
      const topReligion = Object.entries(religionScores)
        .sort((a, b) => b[1] - a[1])[0];
      const topIdeologie = Object.entries(ideologieScores)
        .sort((a, b) => b[1] - a[1])[0];

      // Top 3 : 1 du spirituel, 1 du séculier, puis le 2ème de chaque si différent
      const sortedReligions = Object.entries(religionScores).sort((a, b) => b[1] - a[1]);
      const sortedIdeologies = Object.entries(ideologieScores).sort((a, b) => b[1] - a[1]);

      // Construire un top 3 équilibré entre les deux domaines
      const top3 = [];

      // #1 : Le plus fort des deux catégories
      if (this.scores[sortedReligions[0][0]] >= this.scores[sortedIdeologies[0][0]]) {
        top3.push({ id: sortedReligions[0][0], score: sortedReligions[0][1], domain: 'spirituel', ...RELIGIONS[sortedReligions[0][0]] });
        top3.push({ id: sortedIdeologies[0][0], score: sortedIdeologies[0][1], domain: 'séculier', ...IDEOLOGIES[sortedIdeologies[0][0]] });
        top3.push({ id: sortedReligions[1][0], score: sortedReligions[1][1], domain: 'spirituel', ...RELIGIONS[sortedReligions[1][0]] });
      } else {
        top3.push({ id: sortedIdeologies[0][0], score: sortedIdeologies[0][1], domain: 'séculier', ...IDEOLOGIES[sortedIdeologies[0][0]] });
        top3.push({ id: sortedReligions[0][0], score: sortedReligions[0][1], domain: 'spirituel', ...RELIGIONS[sortedReligions[0][0]] });
        top3.push({ id: sortedIdeologies[1][0], score: sortedIdeologies[1][1], domain: 'séculier', ...IDEOLOGIES[sortedIdeologies[1][0]] });
      }

      return {
        scores: allScores,
        religionScores,
        ideologieScores,
        topReligion: { id: topReligion[0], score: topReligion[1], ...RELIGIONS[topReligion[0]] },
        topIdeologie: { id: topIdeologie[0], score: topIdeologie[1], ...IDEOLOGIES[topIdeologie[0]] },
        top3
      };
    }

    generateAnalysis(results) {
      let analysis = '';

      // Analyse principale
      const { topReligion, topIdeologie, top3 } = results;

      analysis += `<p>Votre profil révèle une <strong>affinité dominante avec les valeurs ${topReligion.label.toLowerCase()}es</strong> (${topReligion.score}%) `;
      analysis += `combinée à une vision du monde proche du <strong>${topIdeologie.label.toLowerCase()}</strong> (${topIdeologie.score}%).</p>`;

      // Héritage religieux de l'idéologie
      if (topIdeologie.heritageReligieux) {
        analysis += `<p class="miroir__heritage"><strong>Le saviez-vous ?</strong> ${topIdeologie.heritageReligieux}</p>`;
      }

      // Concepts clés
      analysis += `<p>Les concepts qui semblent structurer votre pensée : `;
      analysis += `<em>${topReligion.concepts.slice(0, 3).join(', ')}</em> (héritage spirituel) et `;
      analysis += `<em>${topIdeologie.concepts.slice(0, 3).join(', ')}</em> (vision séculière).</p>`;

      // Paradoxes potentiels
      if (topReligion.id === 'bouddhisme' && topIdeologie.id === 'capitalisme') {
        analysis += `<p class="miroir__paradox"><strong>Tension intéressante :</strong> Le bouddhisme prône le détachement des désirs, tandis que le capitalisme repose sur leur stimulation. Comment conciliez-vous ces deux influences ?</p>`;
      } else if (topReligion.id === 'christianisme' && topIdeologie.id === 'capitalisme') {
        analysis += `<p class="miroir__paradox"><strong>Un classique occidental :</strong> L'éthique protestante du travail a historiquement nourri le capitalisme (Max Weber). Mais le Christ chassait les marchands du temple...</p>`;
      } else if (topReligion.id === 'islam' && topIdeologie.id === 'capitalisme') {
        analysis += `<p class="miroir__paradox"><strong>Tension potentielle :</strong> L'islam interdit l'usure (riba) et valorise la communauté, tandis que le capitalisme repose sur l'intérêt et l'individualisme.</p>`;
      } else if ((topReligion.id === 'christianisme' || topReligion.id === 'judaisme') && topIdeologie.id === 'socialisme') {
        analysis += `<p class="miroir__paradox"><strong>Filiation historique :</strong> Beaucoup de penseurs socialistes étaient issus de milieux religieux. La charité chrétienne et la justice prophétique ont nourri l'idéal égalitaire.</p>`;
      }

      return analysis;
    }

    generateReflectionQuestions(results) {
      const questions = [];
      const { topReligion, topIdeologie } = results;

      questions.push(`Saviez-vous que vos valeurs sont aussi proches de la tradition ${topReligion.label.toLowerCase()} ?`);

      if (topIdeologie.heritageReligieux) {
        questions.push(`Le ${topIdeologie.label.toLowerCase()} a des racines religieuses. Cela change-t-il votre perception de cette idéologie ?`);
      }

      questions.push('Quelles valeurs considérez-vous comme "les vôtres" et lesquelles avez-vous héritées sans le savoir ?');
      questions.push('Y a-t-il des contradictions entre vos croyances déclarées et vos valeurs profondes révélées ici ?');

      return questions;
    }

    drawRadar(scores, containerId, systemes) {
      const radarContainer = document.getElementById(containerId);
      if (!radarContainer) return;

      // Taille augmentée pour laisser plus de place aux labels
      const size = 340;
      const center = size / 2;
      const maxRadius = 100; // Rayon fixe pour le graphique
      const axes = Object.keys(systemes);
      const angleStep = (2 * Math.PI) / axes.length;

      let svg = `<svg viewBox="0 0 ${size} ${size}" class="miroir__radar-svg">`;

      // Fond du radar (cercle plein très léger)
      svg += `<circle cx="${center}" cy="${center}" r="${maxRadius}" fill="var(--color-bg-alt)" opacity="0.5"/>`;

      // Cercles de fond concentriques (plus visibles)
      for (let i = 1; i <= 4; i++) {
        const r = (maxRadius / 4) * i;
        svg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--color-text-muted)" stroke-width="1" opacity="${i === 4 ? '0.6' : '0.3'}"/>`;
      }

      // Lignes des axes (plus visibles)
      axes.forEach((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + Math.cos(angle) * maxRadius;
        const y = center + Math.sin(angle) * maxRadius;
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--color-text-muted)" stroke-width="1" opacity="0.4"/>`;
      });

      // Polygone des scores (utiliser le score relatif, max 100%)
      const points = axes.map((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = Math.min(1, (scores[axe] || 0) / 100); // Cap à 100%
        const r = value * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        return `${x},${y}`;
      }).join(' ');

      svg += `<polygon points="${points}" fill="var(--color-primary)" fill-opacity="0.35" stroke="var(--color-primary)" stroke-width="2.5"/>`;

      // Points et labels
      axes.forEach((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = Math.min(1, (scores[axe] || 0) / 100);
        const r = value * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;

        // Point sur le graphique
        svg += `<circle cx="${x}" cy="${y}" r="5" fill="${systemes[axe].color}" stroke="#fff" stroke-width="1.5"/>`;

        // Label avec plus d'espace et meilleur positionnement
        const labelRadius = maxRadius + 55;
        const lx = center + Math.cos(angle) * labelRadius;
        const ly = center + Math.sin(angle) * labelRadius;

        // Ajuster l'ancrage du texte selon la position sur le cercle
        let textAnchor = 'middle';
        const cosAngle = Math.cos(angle);
        if (cosAngle < -0.2) textAnchor = 'end';
        else if (cosAngle > 0.2) textAnchor = 'start';

        // Décaler légèrement verticalement si en haut ou en bas
        const sinAngle = Math.sin(angle);
        let dy = 0;
        if (sinAngle < -0.7) dy = -5; // En haut
        if (sinAngle > 0.7) dy = 5;  // En bas

        // Afficher le nom court + le %
        const scorePercent = scores[axe] || 0;
        svg += `<text x="${lx}" y="${ly + dy}" text-anchor="${textAnchor}" dominant-baseline="middle" fill="${systemes[axe].color}" font-size="11" font-weight="600">${systemes[axe].shortLabel}</text>`;
        svg += `<text x="${lx}" y="${ly + dy + 12}" text-anchor="${textAnchor}" dominant-baseline="middle" fill="var(--color-text-muted)" font-size="9">${scorePercent}%</text>`;
      });

      svg += '</svg>';
      radarContainer.innerHTML = svg;
    }

    generateReadingRecommendations(results) {
      // Collecter les livres des 2 premiers résultats de chaque catégorie
      const { topReligion, topIdeologie } = results;
      const recommendations = [];

      // Livres de la religion dominante
      if (topReligion.livres) {
        recommendations.push({
          systeme: topReligion.label,
          domain: 'Héritage spirituel',
          color: topReligion.color,
          livres: topReligion.livres.slice(0, 2)
        });
      }

      // Livres de l'idéologie dominante
      if (topIdeologie.livres) {
        recommendations.push({
          systeme: topIdeologie.label,
          domain: 'Vision séculière',
          color: topIdeologie.color,
          livres: topIdeologie.livres.slice(0, 2)
        });
      }

      return recommendations;
    }

    showResults() {
      const results = this.calculateResults();
      const analysis = this.generateAnalysis(results);
      const reflectionQuestions = this.generateReflectionQuestions(results);
      const readingRecs = this.generateReadingRecommendations(results);

      const html = `
        <div class="miroir__results">
          <div class="miroir__results-header">
            <h2>Vos Croyances Invisibles</h2>
            <p class="miroir__results-subtitle">Ce que révèle votre cartographie intérieure</p>
          </div>

          <div class="miroir__top3">
            <h3>Vos influences dominantes</h3>
            <p class="miroir__top3-note">Les pourcentages indiquent votre affinité <em>relative</em> au sein de chaque domaine (spirituel ou séculier), pas une mesure absolue.</p>
            <div class="miroir__top3-grid">
              ${results.top3.map((item, index) => `
                <div class="miroir__top3-item" style="--accent-color: ${item.color}">
                  <span class="miroir__top3-rank">${index + 1}</span>
                  <span class="miroir__top3-domain">${item.domain}</span>
                  <span class="miroir__top3-label">${item.label}</span>
                  <span class="miroir__top3-score">${item.score}%</span>
                  <p class="miroir__top3-desc">${item.description}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="miroir__dual-radar">
            <div class="miroir__radar-section">
              <h3>Héritage spirituel</h3>
              <p class="miroir__radar-note">Répartition de vos affinités parmi les traditions religieuses</p>
              <div class="miroir__radar" id="radar-religions"></div>
            </div>
            <div class="miroir__radar-section">
              <h3>Vision séculière</h3>
              <p class="miroir__radar-note">Répartition de vos affinités parmi les idéologies modernes</p>
              <div class="miroir__radar" id="radar-ideologies"></div>
            </div>
          </div>

          <div class="miroir__narrative">
            <h3>Analyse de votre profil</h3>
            ${analysis}
          </div>

          <div class="miroir__readings">
            <h3>Pour approfondir</h3>
            <p class="miroir__readings-intro">Quelques lectures pour explorer vos influences dominantes :</p>
            <div class="miroir__readings-grid">
              ${readingRecs.map(rec => `
                <div class="miroir__readings-section" style="--accent-color: ${rec.color}">
                  <h4>${rec.systeme} <span class="miroir__readings-domain">${rec.domain}</span></h4>
                  <ul>
                    ${rec.livres.map(livre => `
                      <li>
                        <strong>${livre.titre}</strong>${livre.auteur ? ` — ${livre.auteur}` : ''}
                        ${livre.note ? `<br><span class="miroir__readings-note">${livre.note}</span>` : ''}
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="miroir__questions-ouvertes">
            <h3>Questions à méditer</h3>
            <ul>
              ${reflectionQuestions.map(q => `<li>${q}</li>`).join('')}
            </ul>
          </div>

          <div class="miroir__disclaimer-results">
            <p><strong>Rappel :</strong> Ce quiz révèle des <em>affinités de valeurs</em>, pas une appartenance.
            On peut partager des valeurs bouddhistes sans méditer, ou des valeurs stoïciennes sans avoir lu Marc Aurèle.
            L'objectif est de prendre conscience des influences invisibles qui structurent notre pensée — premier pas vers un vrai libre arbitre.</p>
          </div>

          <div class="miroir__actions">
            <button class="btn btn--primary" id="miroir-restart">
              Refaire le test
            </button>
            <a href="/miroir-pensee.html" class="btn btn--outline">
              Tester ma pensée libre
            </a>
          </div>

          <div class="miroir__share">
            <p>Ce miroir vous a éclairé ? Partagez-le.</p>
            <div class="miroir__share-buttons">
              <button class="miroir__share-btn" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent('Je viens de découvrir mes croyances invisibles : ' + results.top3[0].label + '. Et vous ?')}&url=${encodeURIComponent(window.location.href)}', '_blank')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button class="miroir__share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(() => this.classList.add('copied'))">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `;

      this.container.innerHTML = html;

      // Dessiner les deux radars
      this.drawRadar(results.religionScores, 'radar-religions', RELIGIONS);
      this.drawRadar(results.ideologieScores, 'radar-ideologies', IDEOLOGIES);

      // Animation d'entrée
      const resultsEl = this.container.querySelector('.miroir__results');
      resultsEl.style.opacity = '0';
      requestAnimationFrame(() => {
        resultsEl.style.transition = 'opacity 0.6s ease';
        resultsEl.style.opacity = '1';
      });
    }

    restart() {
      // Réinitialiser
      Object.keys(SYSTEMES).forEach(key => {
        this.scores[key] = 0;
      });
      this.reponses = [];
      this.currentQuestionIndex = 0;

      this.renderQuestion();
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ========================================
  // Initialisation
  // ========================================
  function init() {
    const container = document.getElementById('miroir-croyances-container');
    if (container) {
      new MiroirCroyances(container);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
