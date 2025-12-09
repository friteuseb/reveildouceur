/**
 * Réveil Douceur - Quizz Interactif
 * Gestion des quizz avec questions/réponses
 */

(function() {
  'use strict';

  // ========================================
  // Configuration
  // ========================================
  const QuizzConfig = {
    // Messages de résultat selon le pourcentage
    resultMessages: {
      excellent: {
        min: 90,
        title: 'Excellent !',
        message: 'Vous maîtrisez vraiment ce sujet. Votre esprit critique est aiguisé et vous savez distinguer les faits des idées reçues.'
      },
      tresBien: {
        min: 70,
        title: 'Très bien !',
        message: 'Vous avez de solides connaissances sur ce sujet. Quelques nuances vous ont peut-être échappé, mais votre compréhension est bonne.'
      },
      bien: {
        min: 50,
        title: 'Pas mal !',
        message: 'Vous avez des bases, mais certaines idées reçues persistent. Ce quizz vous aura permis de découvrir quelques réalités méconnues.'
      },
      moyen: {
        min: 30,
        title: 'À améliorer',
        message: 'Plusieurs réponses vous ont surpris ? C\'est normal, ces sujets sont souvent mal compris. Relisez les explications pour approfondir.'
      },
      faible: {
        min: 0,
        title: 'Découverte !',
        message: 'Ce sujet était nouveau pour vous, et c\'est une bonne chose de l\'avoir exploré ! Les explications vous aideront à mieux comprendre ces enjeux.'
      }
    }
  };

  // ========================================
  // Classe Quizz
  // ========================================
  class Quizz {
    constructor(container) {
      this.container = container;
      this.questions = [];
      this.currentQuestion = 0;
      this.score = 0;
      this.answers = [];
      this.isFinished = false;

      this.init();
    }

    init() {
      // Récupérer toutes les questions
      this.questions = Array.from(
        this.container.querySelectorAll('.quizz__question')
      );

      if (this.questions.length === 0) {
        console.warn('Aucune question trouvée dans le quizz');
        return;
      }

      // Éléments du DOM
      this.progressBar = document.getElementById('quizz-progress');
      this.progressText = document.getElementById('quizz-progress-text');
      this.navContainer = document.getElementById('quizz-nav');
      this.nextBtn = document.getElementById('quizz-next');
      this.resultsContainer = document.getElementById('quizz-results');
      this.restartBtn = document.getElementById('quizz-restart');

      // Initialiser l'affichage
      this.updateProgress();
      this.showQuestion(0);

      // Bind des événements
      this.bindEvents();
    }

    bindEvents() {
      // Clic sur les réponses
      this.questions.forEach((question, qIndex) => {
        const answers = question.querySelectorAll('.quizz__answer');
        answers.forEach(answer => {
          answer.addEventListener('click', () => this.handleAnswer(qIndex, answer));
        });
      });

      // Bouton suivant
      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
      }

      // Bouton recommencer
      if (this.restartBtn) {
        this.restartBtn.addEventListener('click', () => this.restart());
      }

      // Partage
      this.bindShareButtons();
    }

    handleAnswer(questionIndex, selectedAnswer) {
      const question = this.questions[questionIndex];
      const correctAnswer = question.dataset.correct;
      const selectedValue = selectedAnswer.dataset.answer;
      const answers = question.querySelectorAll('.quizz__answer');

      // Empêcher les clics multiples
      if (this.answers[questionIndex] !== undefined) return;

      // Enregistrer la réponse
      this.answers[questionIndex] = selectedValue;
      const isCorrect = selectedValue === correctAnswer;

      if (isCorrect) {
        this.score++;
      }

      // Désactiver toutes les réponses
      answers.forEach(answer => {
        answer.disabled = true;

        // Marquer la bonne réponse
        if (answer.dataset.answer === correctAnswer) {
          answer.classList.add('quizz__answer--correct');
        }

        // Marquer la mauvaise réponse sélectionnée
        if (answer === selectedAnswer && !isCorrect) {
          answer.classList.add('quizz__answer--wrong');
        }
      });

      // Afficher l'explication
      const explanation = question.querySelector('.quizz__explanation');
      if (explanation) {
        explanation.hidden = false;
      }

      // Afficher le bouton suivant ou les résultats
      if (questionIndex < this.questions.length - 1) {
        this.navContainer.hidden = false;
        // Mettre à jour le texte du bouton pour la dernière question
        if (questionIndex === this.questions.length - 2) {
          this.nextBtn.innerHTML = `
            Voir les résultats
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          `;
        }
      } else {
        // Dernière question, afficher les résultats après un délai
        setTimeout(() => this.showResults(), 1500);
      }

      // Mettre à jour la progression
      this.updateProgress();
    }

    nextQuestion() {
      if (this.currentQuestion < this.questions.length - 1) {
        // Cacher la question actuelle
        this.questions[this.currentQuestion].hidden = true;

        // Passer à la suivante
        this.currentQuestion++;
        this.showQuestion(this.currentQuestion);

        // Cacher le bouton suivant
        this.navContainer.hidden = true;

        // Mettre à jour la progression
        this.updateProgress();

        // Scroll vers le haut du quizz
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Afficher les résultats
        this.showResults();
      }
    }

    showQuestion(index) {
      this.questions.forEach((q, i) => {
        q.hidden = i !== index;
      });
    }

    updateProgress() {
      const answeredCount = this.answers.filter(a => a !== undefined).length;
      const progress = (answeredCount / this.questions.length) * 100;

      if (this.progressBar) {
        this.progressBar.style.width = `${progress}%`;
      }

      if (this.progressText) {
        this.progressText.textContent = `Question ${this.currentQuestion + 1}/${this.questions.length}`;
      }
    }

    showResults() {
      this.isFinished = true;

      // Cacher les questions
      this.questions.forEach(q => q.hidden = true);
      this.navContainer.hidden = true;

      // Calculer le pourcentage
      const percentage = Math.round((this.score / this.questions.length) * 100);

      // Déterminer le message
      const resultData = this.getResultMessage(percentage);

      // Mettre à jour l'affichage
      document.getElementById('quizz-score').textContent = this.score;
      document.getElementById('quizz-total').textContent = this.questions.length;
      document.getElementById('quizz-correct').textContent = this.score;
      document.getElementById('quizz-wrong').textContent = this.questions.length - this.score;
      document.getElementById('quizz-results-title').textContent = resultData.title;
      document.getElementById('quizz-results-text').textContent = `${percentage}% de bonnes réponses`;
      document.getElementById('quizz-message').innerHTML = resultData.message;

      // Afficher les résultats
      this.resultsContainer.hidden = false;

      // Mettre à jour la progression à 100%
      if (this.progressBar) {
        this.progressBar.style.width = '100%';
      }
      if (this.progressText) {
        this.progressText.textContent = 'Terminé !';
      }

      // Scroll vers les résultats
      this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    getResultMessage(percentage) {
      const messages = QuizzConfig.resultMessages;

      if (percentage >= messages.excellent.min) return messages.excellent;
      if (percentage >= messages.tresBien.min) return messages.tresBien;
      if (percentage >= messages.bien.min) return messages.bien;
      if (percentage >= messages.moyen.min) return messages.moyen;
      return messages.faible;
    }

    restart() {
      // Réinitialiser les variables
      this.currentQuestion = 0;
      this.score = 0;
      this.answers = [];
      this.isFinished = false;

      // Réinitialiser l'affichage des questions
      this.questions.forEach((question, index) => {
        // Cacher toutes sauf la première
        question.hidden = index !== 0;

        // Réactiver les réponses
        const answers = question.querySelectorAll('.quizz__answer');
        answers.forEach(answer => {
          answer.disabled = false;
          answer.classList.remove(
            'quizz__answer--selected',
            'quizz__answer--correct',
            'quizz__answer--wrong'
          );
        });

        // Cacher les explications
        const explanation = question.querySelector('.quizz__explanation');
        if (explanation) {
          explanation.hidden = true;
        }
      });

      // Réinitialiser le texte du bouton suivant
      if (this.nextBtn) {
        this.nextBtn.innerHTML = `
          Question suivante
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        `;
      }

      // Cacher les éléments
      this.navContainer.hidden = true;
      this.resultsContainer.hidden = true;

      // Mettre à jour la progression
      this.updateProgress();

      // Scroll vers le début
      this.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    bindShareButtons() {
      const shareTwitter = document.getElementById('share-twitter');
      const shareFacebook = document.getElementById('share-facebook');
      const shareCopy = document.getElementById('share-copy');

      if (shareTwitter) {
        shareTwitter.addEventListener('click', () => this.shareTwitter());
      }

      if (shareFacebook) {
        shareFacebook.addEventListener('click', () => this.shareFacebook());
      }

      if (shareCopy) {
        shareCopy.addEventListener('click', () => this.copyLink(shareCopy));
      }
    }

    getShareText() {
      const percentage = Math.round((this.score / this.questions.length) * 100);
      const title = document.querySelector('.article__title')?.textContent || 'un quizz';
      return `J'ai obtenu ${this.score}/${this.questions.length} (${percentage}%) au quizz "${title}" sur Réveil Douceur !`;
    }

    shareTwitter() {
      const text = this.getShareText();
      const url = window.location.href;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(twitterUrl, '_blank', 'width=550,height=420');
    }

    shareFacebook() {
      const url = window.location.href;
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      window.open(fbUrl, '_blank', 'width=550,height=420');
    }

    copyLink(button) {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        button.classList.add('copied');
        button.title = 'Copié !';
        setTimeout(() => {
          button.classList.remove('copied');
          button.title = 'Copier le lien';
        }, 2000);
      }).catch(err => {
        console.error('Erreur lors de la copie:', err);
      });
    }
  }

  // ========================================
  // Initialisation
  // ========================================
  function initQuizz() {
    const quizzContainer = document.getElementById('quizz-container');

    if (quizzContainer) {
      new Quizz(quizzContainer);
    }
  }

  // Attendre le chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizz);
  } else {
    initQuizz();
  }

})();
