/**
 * Système de vote Like/Dislike - Réveil Douceur
 * Un seul vote par IP, stockage SQLite
 */

(function() {
  'use strict';

  const API_URL = '/api/vote.php';

  // Extraire le slug de l'article depuis l'URL
  function getArticleSlug() {
    const path = window.location.pathname;
    const match = path.match(/\/articles\/([a-z0-9-]+)\.html$/);
    return match ? match[1] : null;
  }

  // Créer le HTML du composant de vote
  function createVoteHTML(position) {
    return `
      <div class="article-vote article-vote--${position}" data-position="${position}">
        <span class="article-vote__label">Cet article vous a-t-il été utile ?</span>
        <div class="article-vote__buttons">
          <button class="article-vote__btn article-vote__btn--like" data-vote="1" aria-label="J'aime cet article">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
            </svg>
            <span class="article-vote__count" data-count="likes">0</span>
          </button>
          <button class="article-vote__btn article-vote__btn--dislike" data-vote="-1" aria-label="Je n'aime pas cet article">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/>
            </svg>
            <span class="article-vote__count" data-count="dislikes">0</span>
          </button>
        </div>
      </div>
    `;
  }

  // Mettre à jour l'affichage des votes
  function updateVoteDisplay(data) {
    document.querySelectorAll('.article-vote').forEach(container => {
      // Mettre à jour les compteurs
      container.querySelector('[data-count="likes"]').textContent = data.likes || 0;
      container.querySelector('[data-count="dislikes"]').textContent = data.dislikes || 0;

      // Mettre à jour l'état actif des boutons
      const likeBtn = container.querySelector('.article-vote__btn--like');
      const dislikeBtn = container.querySelector('.article-vote__btn--dislike');

      likeBtn.classList.toggle('active', data.userVote === 1);
      dislikeBtn.classList.toggle('active', data.userVote === -1);
    });
  }

  // Charger les votes depuis l'API
  async function loadVotes(slug) {
    try {
      const response = await fetch(`${API_URL}?article=${encodeURIComponent(slug)}`);
      if (!response.ok) throw new Error('Failed to load votes');
      const data = await response.json();
      updateVoteDisplay(data);
    } catch (error) {
      console.error('Erreur chargement votes:', error);
    }
  }

  // Envoyer un vote
  async function sendVote(slug, voteType) {
    // Désactiver les boutons pendant la requête
    document.querySelectorAll('.article-vote__btn').forEach(btn => {
      btn.disabled = true;
    });

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article: slug,
          vote: voteType
        })
      });

      if (!response.ok) throw new Error('Failed to send vote');
      const data = await response.json();
      updateVoteDisplay(data);
    } catch (error) {
      console.error('Erreur envoi vote:', error);
    } finally {
      // Réactiver les boutons
      document.querySelectorAll('.article-vote__btn').forEach(btn => {
        btn.disabled = false;
      });
    }
  }

  // Gérer le clic sur un bouton de vote
  function handleVoteClick(e, slug) {
    const btn = e.target.closest('.article-vote__btn');
    if (!btn) return;

    const voteType = parseInt(btn.dataset.vote, 10);
    const isActive = btn.classList.contains('active');

    // Si déjà actif, on annule le vote (envoie 0)
    sendVote(slug, isActive ? 0 : voteType);
  }

  // Initialisation
  function init() {
    const slug = getArticleSlug();
    if (!slug) return; // Pas sur une page d'article

    // Trouver les points d'insertion
    const articleHeader = document.querySelector('.article__header');
    const articleSources = document.querySelector('.article__sources');

    if (!articleHeader && !articleSources) return;

    // Insérer le composant en haut (après le header)
    if (articleHeader) {
      const heroImage = document.querySelector('.article__hero-image');
      const insertPoint = heroImage || articleHeader;
      insertPoint.insertAdjacentHTML('afterend', createVoteHTML('top'));
    }

    // Insérer le composant en bas (avant les sources)
    if (articleSources) {
      articleSources.insertAdjacentHTML('beforebegin', createVoteHTML('bottom'));
    }

    // Charger les votes actuels
    loadVotes(slug);

    // Ajouter les écouteurs d'événements
    document.querySelectorAll('.article-vote').forEach(container => {
      container.addEventListener('click', (e) => handleVoteClick(e, slug));
    });
  }

  // Lancer quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
