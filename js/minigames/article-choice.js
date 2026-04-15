/**
 * Mini-Game: Article Choice (Artikel-Wahl)
 * 
 * Players choose the correct article (der/die/das) for a displayed noun on cardboard buttons.
 */

import { CardboardUtils } from '../ui/cardboard-utils.js';

export const ArticleChoice = {
  id: 'article-choice',
  name_de: 'Artikel-Wahl',
  topics: ['artikel'],

  setup(container, task, onComplete) {
    const { content } = task;
    let quizItems = [];
    
    // Support different data structures from task generator
    if (content.questions) {
        quizItems = content.questions;
    } else if (content.quizSets) {
        quizItems = [...content.quizSets].sort(() => Math.random() - 0.5).slice(0, 5);
    } else if (content.type === 'satzarten' && content.sentences) {
      quizItems = [...content.sentences].sort(() => Math.random() - 0.5).slice(0, 5).map(s => ({
        word: s.sentence,
        correct: s.type,
        options: ['Aussagesatz', 'Fragesatz', 'Ausrufesatz']
      }));
    }

    if (!quizItems || quizItems.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    let currentIndex = 0;
    let correctCount = 0;
    const defaultArticles = ['der', 'die', 'das'];

    const renderQuestion = () => {
      const item = quizItems[currentIndex];
      const options = item.options || defaultArticles;
      const correctAns = item.article || item.correct;

      container.innerHTML = `
        <div class="stapler-container" style="justify-content: center; gap: 30px;">
          <div class="cardboard-item" style="width: 80%; max-width: 500px; padding: 40px; font-size: 2rem; cursor: default; background-color: #fdf5e6;">
            <div style="font-size: 0.9rem; font-family: var(--font-handwritten); opacity: 0.6; margin-bottom: 15px;">
                ${item.options ? 'Welche Satzart ist das?' : 'Welcher Artikel passt?'}
            </div>
            ${item.word}
          </div>
          
          <div class="answer-options" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center; width: 100%;">
            ${options.map(opt => `
              <div class="cardboard-item article-btn" data-answer="${opt}" style="min-width: 120px; font-size: 1.4rem;">
                ${opt}
              </div>
            `).join('')}
          </div>
          
          <div style="position: absolute; bottom: 20px; right: 20px; font-family: var(--font-handwritten); font-weight: bold; opacity: 0.8; background: rgba(255,255,255,0.5); padding: 5px 15px; border-radius: 20px;">
            ${currentIndex + 1} / ${quizItems.length}
          </div>
        </div>
      `;

      container.querySelectorAll('.article-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const selected = btn.dataset.answer;
          const isCorrect = selected === correctAns;

          if (isCorrect) {
            correctCount++;
            btn.style.backgroundColor = '#a3de83'; // Success green cardboard
          } else {
            btn.style.backgroundColor = '#ff8a5c'; // Error coral cardboard
            CardboardUtils.wobble(btn);
            
            // Show correct answer on its button
            container.querySelectorAll(`.article-btn[data-answer="${correctAns}"]`).forEach(b => {
                b.style.backgroundColor = '#a3de83';
                b.style.border = '4px solid #4caf50';
            });
          }

          // Disable other buttons
          container.querySelectorAll('.article-btn').forEach(b => b.style.pointerEvents = 'none');

          setTimeout(() => {
            currentIndex++;
            if (currentIndex < quizItems.length) {
              renderQuestion();
            } else {
              const score = Math.round((correctCount / quizItems.length) * 100);
              onComplete({ correct: score >= 80, partial: score >= 50, score });
            }
          }, 1000);
        });
      });
    };

    renderQuestion();

    // Ensure CSS
    if (!document.getElementById('cardboard-games-css')) {
      const link = document.createElement('link');
      link.id = 'cardboard-games-css';
      link.rel = 'stylesheet';
      link.href = 'css/cardboard-games.css';
      document.head.appendChild(link);
    }
  }
};
