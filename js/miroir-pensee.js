/**
 * Réveil Douceur - Miroir de la Pensée Libre
 * Quizz introspectif sur le libre arbitre et la pensée autonome
 */

(function() {
  'use strict';

  // ========================================
  // Configuration des axes d'évaluation
  // ========================================
  const AXES = {
    securiteSociale: {
      id: 'securiteSociale',
      label: 'Sécurité sociale',
      shortLabel: 'Social',
      description: 'Sensibilité au regard des autres et à l\'appartenance au groupe',
      color: '#ed8936'
    },
    securiteMaterielle: {
      id: 'securiteMaterielle',
      label: 'Sécurité matérielle',
      shortLabel: 'Matériel',
      description: 'Attachement à la stabilité professionnelle et financière',
      color: '#48bb78'
    },
    securiteExistentielle: {
      id: 'securiteExistentielle',
      label: 'Sécurité existentielle',
      shortLabel: 'Existentiel',
      description: 'Besoin de sens, de structure et de certitudes',
      color: '#667eea'
    },
    autonomieIntellectuelle: {
      id: 'autonomieIntellectuelle',
      label: 'Autonomie intellectuelle',
      shortLabel: 'Autonomie',
      description: 'Capacité à questionner et construire sa propre pensée',
      color: '#9f7aea'
    },
    conscienceConditionnements: {
      id: 'conscienceConditionnements',
      label: 'Conscience des biais',
      shortLabel: 'Conscience',
      description: 'Lucidité sur ses propres biais et influences',
      color: '#ed64a6'
    }
  };

  // ========================================
  // Profils de résultats
  // ========================================
  const PROFILS = {
    conformiste: {
      id: 'conformiste',
      nom: 'Le Roseau Prudent',
      description: 'Vous avez développé une grande capacité d\'adaptation sociale. Cette flexibilité vous protège, mais elle peut aussi vous éloigner de votre propre voix intérieure.',
      conseil: 'Et si vous preniez le risque, une fois par semaine, d\'exprimer une opinion qui vous est propre, même si elle diffère du consensus ?',
      couleur: '#ed8936'
    },
    questionneur: {
      id: 'questionneur',
      nom: 'L\'Éveilleur Silencieux',
      description: 'Vous questionnez intérieurement beaucoup de choses, mais vous gardez souvent vos réflexions pour vous. La prudence est une qualité, mais le silence permanent peut devenir une prison.',
      conseil: 'Vos questionnements ont de la valeur. Trouvez un espace — journal, ami de confiance, forum — pour les exprimer.',
      couleur: '#667eea'
    },
    chercheur: {
      id: 'chercheur',
      nom: 'Le Chercheur de Vérité',
      description: 'Vous êtes en quête active de compréhension. Vous avez commencé à déconstruire certaines croyances, mais attention à ne pas remplacer un dogme par un autre.',
      conseil: 'La vérité est rarement définitive. Gardez toujours une porte ouverte au doute, même sur vos nouvelles certitudes.',
      couleur: '#9f7aea'
    },
    autonome: {
      id: 'autonome',
      nom: 'Le Penseur Libre',
      description: 'Vous avez développé une réelle autonomie intellectuelle. Vous savez écouter sans vous soumettre, et affirmer sans imposer. Mais cette liberté peut parfois créer de la solitude.',
      conseil: 'La pensée libre ne signifie pas penser seul. Cherchez des esprits complémentaires, pas des miroirs.',
      couleur: '#48bb78'
    },
    rebelle: {
      id: 'rebelle',
      nom: 'Le Contre-Courant',
      description: 'Vous avez une forte tendance à rejeter les idées dominantes. Cette posture peut être libératrice, mais être "contre" systématiquement est aussi une forme de dépendance au groupe.',
      conseil: 'Le vrai libre arbitre, c\'est pouvoir parfois être d\'accord avec la majorité — quand c\'est justifié.',
      couleur: '#e53e3e'
    },
    enTransition: {
      id: 'enTransition',
      nom: 'L\'Être en Mutation',
      description: 'Vous êtes dans une phase de questionnement profond. Les anciennes certitudes vacillent, les nouvelles ne sont pas encore stabilisées. C\'est inconfortable, mais c\'est le terreau de la croissance.',
      conseil: 'Cette période d\'incertitude est précieuse. Ne cherchez pas à la raccourcir. Les vraies transformations prennent du temps.',
      couleur: '#00b5d8'
    }
  };

  // ========================================
  // Questions du quizz
  // ========================================
  const QUESTIONS = {
    // TRONC COMMUN (6 questions)
    tronc: [
      {
        id: 'tc1',
        texte: 'Lors d\'un dîner, quelqu\'un affirme avec assurance une opinion que vous savez être fausse. Que faites-vous spontanément ?',
        type: 'choix',
        axes: ['securiteSociale', 'autonomieIntellectuelle'],
        reponses: [
          { id: 'a', texte: 'Je ne dis rien pour éviter le conflit', scores: { securiteSociale: 2, autonomieIntellectuelle: -1 } },
          { id: 'b', texte: 'J\'attends de voir si quelqu\'un d\'autre réagit d\'abord', scores: { securiteSociale: 1, autonomieIntellectuelle: 0 } },
          { id: 'c', texte: 'Je pose une question pour l\'amener à nuancer', scores: { securiteSociale: 0, autonomieIntellectuelle: 1 } },
          { id: 'd', texte: 'Je le contredis directement, preuves à l\'appui', scores: { securiteSociale: -1, autonomieIntellectuelle: 2 } }
        ]
      },
      {
        id: 'tc2',
        texte: 'Quand vous découvrez qu\'une de vos croyances était basée sur une information erronée, que ressentez-vous principalement ?',
        type: 'choix',
        axes: ['securiteExistentielle', 'conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: 'De l\'inconfort, voire de l\'anxiété', scores: { securiteExistentielle: 2, conscienceConditionnements: 0 } },
          { id: 'b', texte: 'De l\'agacement envers ceux qui m\'ont induit en erreur', scores: { securiteExistentielle: 1, conscienceConditionnements: 0 } },
          { id: 'c', texte: 'De la curiosité pour comprendre comment j\'ai pu me tromper', scores: { securiteExistentielle: 0, conscienceConditionnements: 2 } },
          { id: 'd', texte: 'Un certain enthousiasme à l\'idée de mieux comprendre', scores: { securiteExistentielle: -1, conscienceConditionnements: 2 } }
        ]
      },
      {
        id: 'tc3',
        texte: 'D\'où proviennent principalement les informations qui façonnent votre vision du monde ?',
        type: 'choix',
        axes: ['autonomieIntellectuelle', 'conscienceConditionnements'],
        note: 'Par "indépendant", on entend : non subventionné par l\'État, sans actionnaire milliardaire, financement transparent (abonnés, dons)',
        reponses: [
          { id: 'a', texte: 'Les grands médias (TV, radio, journaux nationaux subventionnés)', scores: { autonomieIntellectuelle: -1, conscienceConditionnements: 0 } },
          { id: 'b', texte: 'Les réseaux sociaux, influenceurs et mon entourage', scores: { autonomieIntellectuelle: 0, conscienceConditionnements: 0 } },
          { id: 'c', texte: 'Des médias indépendants (financement par abonnés, sans aide d\'État)', scores: { autonomieIntellectuelle: 1, conscienceConditionnements: 1 } },
          { id: 'd', texte: 'Je croise systématiquement plusieurs types de sources (mainstream ET alternatives)', scores: { autonomieIntellectuelle: 2, conscienceConditionnements: 2 } }
        ]
      },
      {
        id: 'tc4',
        texte: 'Si demain votre employeur vous demandait de défendre publiquement une position contraire à vos convictions profondes, que feriez-vous ?',
        type: 'choix',
        axes: ['securiteMaterielle', 'autonomieIntellectuelle'],
        reponses: [
          { id: 'a', texte: 'Je le ferais, un emploi c\'est un emploi', scores: { securiteMaterielle: 2, autonomieIntellectuelle: -2 } },
          { id: 'b', texte: 'Je le ferais en minimisant mon implication visible', scores: { securiteMaterielle: 1, autonomieIntellectuelle: -1 } },
          { id: 'c', texte: 'Je chercherais à négocier ou à m\'en extraire', scores: { securiteMaterielle: 0, autonomieIntellectuelle: 1 } },
          { id: 'd', texte: 'Je refuserais, quitte à en assumer les conséquences', scores: { securiteMaterielle: -1, autonomieIntellectuelle: 2 } }
        ]
      },
      {
        id: 'tc5',
        texte: 'Complétez cette phrase : "La plupart des gens autour de moi..."',
        type: 'choix',
        axes: ['securiteSociale', 'conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: '...pensent globalement comme moi sur les sujets importants', scores: { securiteSociale: 1, conscienceConditionnements: -1 } },
          { id: 'b', texte: '...ont des avis que je respecte sans forcément les partager', scores: { securiteSociale: 0, conscienceConditionnements: 1 } },
          { id: 'c', texte: '...répètent souvent des idées reçues sans les questionner', scores: { securiteSociale: -1, conscienceConditionnements: 1 } },
          { id: 'd', texte: '...sont, comme moi, influencés par des forces qu\'ils ne voient pas', scores: { securiteSociale: 0, conscienceConditionnements: 2 } }
        ]
      },
      {
        id: 'tc6',
        texte: 'Quand avez-vous changé d\'avis sur un sujet important pour la dernière fois ?',
        type: 'choix',
        axes: ['autonomieIntellectuelle', 'securiteExistentielle'],
        reponses: [
          { id: 'a', texte: 'Je ne me souviens pas, mes convictions sont stables', scores: { autonomieIntellectuelle: -1, securiteExistentielle: 2 } },
          { id: 'b', texte: 'Il y a plusieurs années', scores: { autonomieIntellectuelle: 0, securiteExistentielle: 1 } },
          { id: 'c', texte: 'Ces derniers mois', scores: { autonomieIntellectuelle: 1, securiteExistentielle: 0 } },
          { id: 'd', texte: 'Je suis en questionnement permanent, ça évolue souvent', scores: { autonomieIntellectuelle: 2, securiteExistentielle: -1 } }
        ]
      }
    ],

    // BRANCHE : Sécurité sociale (peurs du jugement)
    securiteSociale: [
      {
        id: 'ss1',
        texte: 'Imaginez que vous postiez sur les réseaux sociaux une opinion controversée mais sincère. Quelle serait votre principale crainte ?',
        type: 'choix',
        axes: ['securiteSociale'],
        reponses: [
          { id: 'a', texte: 'Perdre des amis ou des contacts professionnels', scores: { securiteSociale: 2 } },
          { id: 'b', texte: 'Être mal compris ou caricaturé', scores: { securiteSociale: 1 } },
          { id: 'c', texte: 'Devoir me justifier longuement', scores: { securiteSociale: 0 } },
          { id: 'd', texte: 'Je n\'aurais pas de crainte particulière', scores: { securiteSociale: -1 } }
        ]
      },
      {
        id: 'ss2',
        texte: 'Vous apprenez qu\'un ami proche a des opinions politiques radicalement opposées aux vôtres. Comment réagissez-vous ?',
        type: 'choix',
        axes: ['securiteSociale', 'autonomieIntellectuelle'],
        reponses: [
          { id: 'a', texte: 'Je préfère éviter le sujet pour préserver la relation', scores: { securiteSociale: 2, autonomieIntellectuelle: -1 } },
          { id: 'b', texte: 'Je suis déçu(e) et ça change mon regard sur lui/elle', scores: { securiteSociale: 1, autonomieIntellectuelle: 0 } },
          { id: 'c', texte: 'Je suis curieux de comprendre son cheminement', scores: { securiteSociale: 0, autonomieIntellectuelle: 1 } },
          { id: 'd', texte: 'Ça ne change rien, les idées ne définissent pas l\'amitié', scores: { securiteSociale: -1, autonomieIntellectuelle: 1 } }
        ]
      },
      {
        id: 'ss3',
        texte: 'Dans un groupe, vous sentez-vous plus à l\'aise quand...',
        type: 'choix',
        axes: ['securiteSociale'],
        reponses: [
          { id: 'a', texte: '...tout le monde est d\'accord sur l\'essentiel', scores: { securiteSociale: 2 } },
          { id: 'b', texte: '...les désaccords restent polis et superficiels', scores: { securiteSociale: 1 } },
          { id: 'c', texte: '...on peut débattre ouvertement de tout', scores: { securiteSociale: 0 } },
          { id: 'd', texte: '...je peux être en désaccord sans que ça pose problème', scores: { securiteSociale: -1 } }
        ]
      }
    ],

    // BRANCHE : Sécurité existentielle (croyances, sens)
    securiteExistentielle: [
      {
        id: 'se1',
        texte: 'L\'idée qu\'il n\'y ait peut-être pas de sens profond à l\'existence vous...',
        type: 'choix',
        axes: ['securiteExistentielle'],
        reponses: [
          { id: 'a', texte: '...est insupportable, il doit y avoir quelque chose', scores: { securiteExistentielle: 2 } },
          { id: 'b', texte: '...met mal à l\'aise, je préfère ne pas y penser', scores: { securiteExistentielle: 1 } },
          { id: 'c', texte: '...interroge, mais ne m\'angoisse pas', scores: { securiteExistentielle: 0 } },
          { id: 'd', texte: '...libère, je crée mon propre sens', scores: { securiteExistentielle: -1 } }
        ]
      },
      {
        id: 'se2',
        texte: 'Concernant les grandes questions (origine de l\'univers, conscience, mort), vous diriez que...',
        type: 'choix',
        axes: ['securiteExistentielle', 'conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: 'J\'ai une vision claire, portée par ma foi ou ma philosophie', scores: { securiteExistentielle: 2, conscienceConditionnements: 0 } },
          { id: 'b', texte: 'La science répondra un jour à tout, j\'ai confiance', scores: { securiteExistentielle: 1, conscienceConditionnements: 0 } },
          { id: 'c', texte: 'Ces questions restent ouvertes, et c\'est stimulant', scores: { securiteExistentielle: 0, conscienceConditionnements: 1 } },
          { id: 'd', texte: 'Je suis confortable avec le fait de ne pas savoir', scores: { securiteExistentielle: -1, conscienceConditionnements: 2 } }
        ]
      },
      {
        id: 'se3',
        texte: 'Parmi ces affirmations, laquelle vous semble la plus vraie ?',
        type: 'choix',
        axes: ['securiteExistentielle', 'autonomieIntellectuelle'],
        reponses: [
          { id: 'a', texte: 'Il existe des vérités absolues qu\'on peut atteindre', scores: { securiteExistentielle: 2, autonomieIntellectuelle: 0 } },
          { id: 'b', texte: 'La vérité dépend du contexte et de la perspective', scores: { securiteExistentielle: 0, autonomieIntellectuelle: 1 } },
          { id: 'c', texte: 'Seule la méthode scientifique peut approcher la vérité', scores: { securiteExistentielle: 1, autonomieIntellectuelle: 1 } },
          { id: 'd', texte: 'La "vérité" est une construction, utile mais provisoire', scores: { securiteExistentielle: -1, autonomieIntellectuelle: 2 } }
        ]
      },
      {
        id: 'se4',
        texte: 'Vous vous définiriez plutôt comme...',
        type: 'choix',
        axes: ['securiteExistentielle', 'conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: 'Croyant(e) / spirituel(le)', scores: { securiteExistentielle: 1, conscienceConditionnements: 0 } },
          { id: 'b', texte: 'Athée convaincu(e)', scores: { securiteExistentielle: 0, conscienceConditionnements: 0, branche: 'croyancesSubstitut' } },
          { id: 'c', texte: 'Agnostique / en recherche', scores: { securiteExistentielle: 0, conscienceConditionnements: 1 } },
          { id: 'd', texte: 'Je refuse les étiquettes sur ce sujet', scores: { securiteExistentielle: -1, conscienceConditionnements: 2 } }
        ]
      }
    ],

    // BRANCHE : Croyances de substitution (pour les athées/matérialistes)
    croyancesSubstitut: [
      {
        id: 'cs1',
        texte: 'En tant que non-croyant, sur quoi repose principalement votre vision du monde ?',
        type: 'choix',
        axes: ['conscienceConditionnements', 'securiteExistentielle'],
        reponses: [
          { id: 'a', texte: 'La science et la raison, exclusivement', scores: { conscienceConditionnements: 0, securiteExistentielle: 1 } },
          { id: 'b', texte: 'Le progrès humain et technologique', scores: { conscienceConditionnements: 0, securiteExistentielle: 1 } },
          { id: 'c', texte: 'L\'expérience personnelle et l\'intuition', scores: { conscienceConditionnements: 1, securiteExistentielle: 0 } },
          { id: 'd', texte: 'Je n\'ai pas besoin d\'un socle, je navigue à vue', scores: { conscienceConditionnements: 2, securiteExistentielle: -1 } }
        ]
      },
      {
        id: 'cs2',
        texte: 'Pensez-vous que l\'athéisme ou le matérialisme puissent être, eux aussi, des formes de croyance ?',
        type: 'choix',
        axes: ['conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: 'Non, c\'est l\'absence de croyance, par définition', scores: { conscienceConditionnements: -1 } },
          { id: 'b', texte: 'Peut-être, je n\'y avais jamais réfléchi', scores: { conscienceConditionnements: 1 } },
          { id: 'c', texte: 'Oui, toute vision du monde repose sur des postulats', scores: { conscienceConditionnements: 2 } },
          { id: 'd', texte: 'La question est biaisée', scores: { conscienceConditionnements: 0 } }
        ]
      }
    ],

    // BRANCHE : Conditionnements et autonomie
    autonomie: [
      {
        id: 'au1',
        texte: 'Parmi ces influences, laquelle a le plus façonné votre vision du monde actuelle ?',
        type: 'choix',
        axes: ['conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: 'Mon éducation familiale', scores: { conscienceConditionnements: 0 } },
          { id: 'b', texte: 'L\'école et les médias', scores: { conscienceConditionnements: 0 } },
          { id: 'c', texte: 'Mes expériences personnelles et voyages', scores: { conscienceConditionnements: 1 } },
          { id: 'd', texte: 'Un travail conscient de remise en question', scores: { conscienceConditionnements: 2 } }
        ]
      },
      {
        id: 'au2',
        texte: 'Avez-vous déjà identifié une croyance que vous aviez absorbée inconsciemment (de vos parents, de l\'école, des médias, de votre milieu social) ?',
        type: 'choix',
        axes: ['conscienceConditionnements', 'autonomieIntellectuelle'],
        note: 'Exemples : "il faut faire des études pour réussir", "le progrès est toujours bon", "les gens qui pensent X sont dangereux", "on ne peut pas remettre en question Y"...',
        reponses: [
          { id: 'a', texte: 'Non, mes croyances sont les miennes', scores: { conscienceConditionnements: -1, autonomieIntellectuelle: -1 } },
          { id: 'b', texte: 'Peut-être une ou deux, rien de majeur', scores: { conscienceConditionnements: 0, autonomieIntellectuelle: 0 } },
          { id: 'c', texte: 'Oui, plusieurs, et j\'en ai abandonné certaines', scores: { conscienceConditionnements: 1, autonomieIntellectuelle: 1 } },
          { id: 'd', texte: 'C\'est un travail permanent, j\'en découvre régulièrement', scores: { conscienceConditionnements: 2, autonomieIntellectuelle: 2 } }
        ]
      },
      {
        id: 'au3',
        texte: 'Face à un "expert" médiatique (médecin TV, économiste de plateau, scientifique institutionnel) dont l\'avis contredit votre intuition, vous...',
        type: 'choix',
        axes: ['autonomieIntellectuelle', 'securiteExistentielle'],
        note: 'Attention : un expert peut avoir des conflits d\'intérêts (financements, employeur, carrière) qui biaisent son discours',
        reponses: [
          { id: 'a', texte: 'Faites confiance à l\'expert, il sait mieux', scores: { autonomieIntellectuelle: -1, securiteExistentielle: 1 } },
          { id: 'b', texte: 'Cherchez un second avis qui confirme le vôtre', scores: { autonomieIntellectuelle: 0, securiteExistentielle: 0 } },
          { id: 'c', texte: 'Analysez ses arguments ET ses potentiels conflits d\'intérêts', scores: { autonomieIntellectuelle: 1, securiteExistentielle: 0 } },
          { id: 'd', texte: 'Gardez votre intuition en tête, les experts se trompent aussi', scores: { autonomieIntellectuelle: 2, securiteExistentielle: -1 } }
        ]
      }
    ],

    // QUESTIONS DE SYNTHÈSE (3 questions)
    synthese: [
      {
        id: 'sy1',
        texte: 'Si vous deviez caractériser votre rapport à la pensée dominante, vous diriez...',
        type: 'choix',
        axes: ['autonomieIntellectuelle', 'securiteSociale'],
        note: 'La pensée dominante = ce que la majorité des gens instruits, des médias mainstream et des institutions considèrent comme "évident" ou "raisonnable"',
        reponses: [
          { id: 'a', texte: 'Je suis globalement en phase avec elle', scores: { autonomieIntellectuelle: -1, securiteSociale: 1 } },
          { id: 'b', texte: 'J\'ai des doutes mais je les garde pour moi', scores: { autonomieIntellectuelle: 0, securiteSociale: 1 } },
          { id: 'c', texte: 'Je la questionne ouvertement sur certains points', scores: { autonomieIntellectuelle: 1, securiteSociale: 0 } },
          { id: 'd', texte: 'Je m\'en suis largement affranchi(e)', scores: { autonomieIntellectuelle: 2, securiteSociale: -1 } }
        ]
      },
      {
        id: 'sy2',
        texte: 'En terminant ce questionnaire, quel sentiment domine ?',
        type: 'choix',
        axes: ['conscienceConditionnements', 'securiteExistentielle'],
        reponses: [
          { id: 'a', texte: 'Ces questions sont déstabilisantes', scores: { conscienceConditionnements: 1, securiteExistentielle: 1 } },
          { id: 'b', texte: 'J\'ai confirmé ce que je pensais déjà', scores: { conscienceConditionnements: 0, securiteExistentielle: 1 } },
          { id: 'c', texte: 'J\'ai des pistes de réflexion intéressantes', scores: { conscienceConditionnements: 1, securiteExistentielle: 0 } },
          { id: 'd', texte: 'J\'ai découvert des angles morts dans ma pensée', scores: { conscienceConditionnements: 2, securiteExistentielle: -1 } }
        ]
      },
      {
        id: 'sy3',
        texte: 'Finalement, pensez-vous agir principalement selon votre libre arbitre ?',
        type: 'choix',
        axes: ['autonomieIntellectuelle', 'conscienceConditionnements'],
        reponses: [
          { id: 'a', texte: 'Oui, absolument', scores: { autonomieIntellectuelle: 0, conscienceConditionnements: -1 } },
          { id: 'b', texte: 'En grande partie, oui', scores: { autonomieIntellectuelle: 1, conscienceConditionnements: 0 } },
          { id: 'c', texte: 'Moins que je ne le pensais avant ce test', scores: { autonomieIntellectuelle: 1, conscienceConditionnements: 2 } },
          { id: 'd', texte: 'Le libre arbitre existe-t-il vraiment ?', scores: { autonomieIntellectuelle: 2, conscienceConditionnements: 2 } }
        ]
      }
    ]
  };

  // ========================================
  // Classe principale du Quizz
  // ========================================
  class MiroirPensee {
    constructor(container) {
      this.container = container;
      this.scores = {
        securiteSociale: 0,
        securiteMaterielle: 0,
        securiteExistentielle: 0,
        autonomieIntellectuelle: 0,
        conscienceConditionnements: 0
      };
      this.reponses = [];
      this.currentPhase = 'tronc';
      this.currentQuestionIndex = 0;
      this.questionsQueue = [...QUESTIONS.tronc];
      this.totalQuestionsAnswered = 0;
      this.branchesVisitees = new Set(['tronc']);

      this.init();
    }

    init() {
      this.renderQuestion();
      this.bindEvents();
    }

    bindEvents() {
      // Délégation d'événements pour les réponses
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
      return this.questionsQueue[this.currentQuestionIndex];
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
      for (const [axe, score] of Object.entries(reponse.scores)) {
        if (this.scores[axe] !== undefined) {
          this.scores[axe] += score;
        }
      }

      this.totalQuestionsAnswered++;

      // Animation de sélection
      const allAnswers = this.container.querySelectorAll('.miroir__answer');
      allAnswers.forEach(btn => {
        btn.disabled = true;
        if (btn === answerBtn) {
          btn.classList.add('miroir__answer--selected');
        }
      });

      // Vérifier si branchement spécifique
      if (reponse.branche && !this.branchesVisitees.has(reponse.branche)) {
        this.branchesVisitees.add(reponse.branche);
        // Insérer les questions de la branche après la question actuelle
        const brancheQuestions = QUESTIONS[reponse.branche] || [];
        this.questionsQueue.splice(this.currentQuestionIndex + 1, 0, ...brancheQuestions);
      }

      // Passer à la question suivante après un délai
      setTimeout(() => {
        this.nextQuestion();
      }, 600);
    }

    nextQuestion() {
      this.currentQuestionIndex++;

      // Déterminer la prochaine phase si nécessaire
      if (this.currentQuestionIndex >= this.questionsQueue.length) {
        this.determineNextPhase();
      }

      if (this.currentQuestionIndex < this.questionsQueue.length) {
        this.renderQuestion();
      } else {
        this.showResults();
      }
    }

    determineNextPhase() {
      // Après le tronc commun, ajouter les branches selon les scores
      if (this.currentPhase === 'tronc') {
        // Toujours ajouter autonomie
        if (!this.branchesVisitees.has('autonomie')) {
          this.questionsQueue.push(...QUESTIONS.autonomie);
          this.branchesVisitees.add('autonomie');
        }

        // Ajouter sécurité sociale si score élevé
        if (this.scores.securiteSociale > 2 && !this.branchesVisitees.has('securiteSociale')) {
          this.questionsQueue.push(...QUESTIONS.securiteSociale);
          this.branchesVisitees.add('securiteSociale');
        }

        // Ajouter sécurité existentielle si score élevé
        if (this.scores.securiteExistentielle > 1 && !this.branchesVisitees.has('securiteExistentielle')) {
          this.questionsQueue.push(...QUESTIONS.securiteExistentielle);
          this.branchesVisitees.add('securiteExistentielle');
        }

        // Ajouter synthèse à la fin
        this.questionsQueue.push(...QUESTIONS.synthese);
        this.branchesVisitees.add('synthese');

        this.currentPhase = 'branches';
      }
    }

    getProgress() {
      // Estimation du nombre total de questions
      const estimatedTotal = 18; // Approximation
      return Math.min(100, Math.round((this.totalQuestionsAnswered / estimatedTotal) * 100));
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
          <span class="miroir__progress-text">${this.totalQuestionsAnswered + 1} / ~20</span>
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

    calculateProfil() {
      // Normaliser les scores (0-100)
      const maxPossible = 15; // Score max théorique par axe
      const normalizedScores = {};

      for (const [axe, score] of Object.entries(this.scores)) {
        // Transformer le score en pourcentage 0-100
        // Les scores peuvent être négatifs, on les recale
        normalizedScores[axe] = Math.max(0, Math.min(100, ((score + maxPossible) / (2 * maxPossible)) * 100));
      }

      // Déterminer le profil dominant
      const autonomie = normalizedScores.autonomieIntellectuelle;
      const conscience = normalizedScores.conscienceConditionnements;
      const securiteSoc = normalizedScores.securiteSociale;
      const securiteExist = normalizedScores.securiteExistentielle;

      let profil;

      if (autonomie > 70 && conscience > 60) {
        profil = PROFILS.autonome;
      } else if (autonomie > 60 && securiteSoc > 60) {
        profil = PROFILS.rebelle;
      } else if (conscience > 60 && autonomie > 40) {
        profil = PROFILS.chercheur;
      } else if (securiteSoc > 60 && autonomie < 40) {
        profil = PROFILS.conformiste;
      } else if (conscience > 50 && securiteExist > 50) {
        profil = PROFILS.enTransition;
      } else {
        profil = PROFILS.questionneur;
      }

      return {
        profil,
        scores: normalizedScores
      };
    }

    generateNarrativeText(profil, scores) {
      let texte = '';

      // Analyse des peurs
      if (scores.securiteSociale > 60) {
        texte += 'Votre besoin d\'appartenance au groupe est un moteur puissant dans vos décisions. ';
      } else if (scores.securiteSociale < 40) {
        texte += 'Le regard des autres semble avoir peu d\'emprise sur votre pensée. ';
      }

      if (scores.securiteMaterielle > 60) {
        texte += 'La stabilité matérielle joue un rôle important dans vos choix, parfois au détriment de vos convictions. ';
      }

      if (scores.securiteExistentielle > 70) {
        texte += 'Vous avez un fort besoin de sens et de structure, ce qui peut vous amener à adhérer à des systèmes de pensée établis. ';
      } else if (scores.securiteExistentielle < 30) {
        texte += 'Vous semblez à l\'aise avec l\'incertitude existentielle, une qualité rare. ';
      }

      // Analyse de l'autonomie
      if (scores.autonomieIntellectuelle > 70) {
        texte += 'Votre capacité à penser par vous-même est développée, mais attention à l\'isolement intellectuel. ';
      } else if (scores.autonomieIntellectuelle < 40) {
        texte += 'Votre pensée semble encore fortement influencée par votre environnement. C\'est humain, mais en avez-vous conscience ? ';
      }

      // Analyse de la conscience
      if (scores.conscienceConditionnements > 70) {
        texte += 'Vous avez une bonne lucidité sur les mécanismes d\'influence. Cette conscience est le premier pas vers la liberté.';
      } else if (scores.conscienceConditionnements < 40) {
        texte += 'Certains conditionnements agissent peut-être en vous sans que vous les perceviez. Ce test peut être un point de départ.';
      }

      return texte || 'Votre profil est nuancé et ne se laisse pas facilement catégoriser. C\'est peut-être le signe d\'une pensée en mouvement.';
    }

    generateReflectionQuestions(scores) {
      const questions = [];

      if (scores.securiteSociale > 50) {
        questions.push('Quelle opinion gardez-vous secrète par peur du jugement ?');
      }
      if (scores.securiteExistentielle > 50) {
        questions.push('Que se passerait-il si vos certitudes actuelles s\'effondraient ?');
      }
      if (scores.autonomieIntellectuelle < 50) {
        questions.push('Quelle est la dernière idée que vous avez adoptée après réflexion personnelle, et non par influence ?');
      }
      if (scores.conscienceConditionnements < 50) {
        questions.push('Quelles croyances avez-vous héritées de votre éducation sans jamais les questionner ?');
      }

      // Toujours ajouter cette question finale
      questions.push('Si vous étiez totalement libre de toute peur et de tout conditionnement, que penseriez-vous différemment ?');

      return questions;
    }

    showResults() {
      const { profil, scores } = this.calculateProfil();
      const narrativeText = this.generateNarrativeText(profil, scores);
      const reflectionQuestions = this.generateReflectionQuestions(scores);

      const html = `
        <div class="miroir__results">
          <div class="miroir__results-header">
            <div class="miroir__profil-icon" style="background: ${profil.couleur}">
              ${profil.nom.charAt(0)}
            </div>
            <h2 class="miroir__profil-nom">${profil.nom}</h2>
            <p class="miroir__profil-desc">${profil.description}</p>
          </div>

          <div class="miroir__radar-container">
            <h3>Votre cartographie intérieure</h3>
            <div class="miroir__radar" id="miroir-radar"></div>
            <div class="miroir__radar-legend">
              ${Object.values(AXES).map(axe => `
                <div class="miroir__radar-legend-item">
                  <span class="miroir__radar-legend-color" style="background: ${axe.color}"></span>
                  <span class="miroir__radar-legend-label">${axe.label}</span>
                  <span class="miroir__radar-legend-value">${Math.round(scores[axe.id])}%</span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="miroir__narrative">
            <h3>Ce que révèle votre parcours</h3>
            <p>${narrativeText}</p>
          </div>

          <div class="miroir__conseil">
            <h3>Piste de réflexion</h3>
            <p>${profil.conseil}</p>
          </div>

          <div class="miroir__questions-ouvertes">
            <h3>Questions à emporter</h3>
            <ul>
              ${reflectionQuestions.map(q => `<li>${q}</li>`).join('')}
            </ul>
          </div>

          <div class="miroir__actions">
            <button class="btn btn--primary" id="miroir-restart">
              Refaire le test
            </button>
            <a href="/" class="btn btn--outline">
              Explorer les articles
            </a>
          </div>

          <div class="miroir__share">
            <p>Ce miroir vous a été utile ? Partagez-le.</p>
            <div class="miroir__share-buttons">
              <button class="miroir__share-btn" onclick="window.open('https://twitter.com/intent/tweet?text=${encodeURIComponent('Je viens de découvrir mon profil de pensée libre : ' + profil.nom + '. Et vous ?')}&url=${encodeURIComponent(window.location.href)}', '_blank')">
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

      // Dessiner le radar
      this.drawRadar(scores);

      // Animation d'entrée
      const results = this.container.querySelector('.miroir__results');
      results.style.opacity = '0';
      requestAnimationFrame(() => {
        results.style.transition = 'opacity 0.6s ease';
        results.style.opacity = '1';
      });
    }

    drawRadar(scores) {
      const radarContainer = document.getElementById('miroir-radar');
      if (!radarContainer) return;

      const size = 280;
      const center = size / 2;
      const maxRadius = size / 2 - 30;
      const axes = Object.keys(AXES);
      const angleStep = (2 * Math.PI) / axes.length;

      // Créer le SVG
      let svg = `<svg viewBox="0 0 ${size} ${size}" class="miroir__radar-svg">`;

      // Cercles de fond
      for (let i = 1; i <= 4; i++) {
        const r = (maxRadius / 4) * i;
        svg += `<circle cx="${center}" cy="${center}" r="${r}" fill="none" stroke="var(--color-border)" stroke-width="1" opacity="0.3"/>`;
      }

      // Lignes des axes
      axes.forEach((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const x = center + Math.cos(angle) * maxRadius;
        const y = center + Math.sin(angle) * maxRadius;
        svg += `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="var(--color-border)" stroke-width="1" opacity="0.3"/>`;
      });

      // Polygone des scores
      const points = axes.map((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = scores[axe] / 100;
        const r = value * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        return `${x},${y}`;
      }).join(' ');

      svg += `<polygon points="${points}" fill="var(--color-primary)" fill-opacity="0.3" stroke="var(--color-primary)" stroke-width="2"/>`;

      // Points sur chaque axe
      axes.forEach((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const value = scores[axe] / 100;
        const r = value * maxRadius;
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        svg += `<circle cx="${x}" cy="${y}" r="5" fill="${AXES[axe].color}"/>`;
      });

      // Labels (texte court de chaque axe)
      axes.forEach((axe, i) => {
        const angle = i * angleStep - Math.PI / 2;
        const labelRadius = maxRadius + 25;
        const x = center + Math.cos(angle) * labelRadius;
        const y = center + Math.sin(angle) * labelRadius;

        // Ajuster l'ancrage du texte selon la position
        let textAnchor = 'middle';
        if (Math.cos(angle) < -0.3) textAnchor = 'end';
        else if (Math.cos(angle) > 0.3) textAnchor = 'start';

        svg += `<text x="${x}" y="${y}" text-anchor="${textAnchor}" dominant-baseline="middle" fill="${AXES[axe].color}" font-size="11" font-weight="500">${AXES[axe].shortLabel}</text>`;
      });

      svg += '</svg>';
      radarContainer.innerHTML = svg;
    }

    restart() {
      this.scores = {
        securiteSociale: 0,
        securiteMaterielle: 0,
        securiteExistentielle: 0,
        autonomieIntellectuelle: 0,
        conscienceConditionnements: 0
      };
      this.reponses = [];
      this.currentPhase = 'tronc';
      this.currentQuestionIndex = 0;
      this.questionsQueue = [...QUESTIONS.tronc];
      this.totalQuestionsAnswered = 0;
      this.branchesVisitees = new Set(['tronc']);

      this.renderQuestion();
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ========================================
  // Initialisation
  // ========================================
  function init() {
    const container = document.getElementById('miroir-container');
    if (container) {
      new MiroirPensee(container);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
