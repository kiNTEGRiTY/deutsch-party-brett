/**
 * High-Fidelity: Word Alchemy (Wort-Alchemie)
 * Mix syllables/prefixes in a bubbling cauldron to create "Golden Words".
 */

import { SoundManager } from '../ui/sound-manager.js?v=game-feel-8';

export const WordAlchemy = {
  id: 'word-alchemy',
  name_de: 'Wort-Alchemie',
  topics: ['wortbildung', 'wortschatz', 'rechtschreibung'],

  setup(container, task, onComplete) {
    const goals = [
      { base: 'stellen', options: ['vor', 'be', 'ge', 'ent'], answer: 'vor', full: 'vorstellen' },
      { base: 'laufen', options: ['hin', 'weg', 'mit', 'aus'], answer: 'hin', full: 'hinlaufen' }
    ];
    const goal = goals[Math.floor(Math.random() * goals.length)];

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.className = 'alchemy-stage';

      wrapper.innerHTML = `
        <div class="alchemy-header">
          <div class="premium-kicker">Wortlabor</div>
          <h3>Die Alchemie-Küche</h3>
          <p>Mische das richtige Präfix zu <span class="alchemy-base-word">„${goal.base}“</span>.</p>
        </div>

        <div id="wa-shelf" class="alchemy-shelf">
          ${goal.options.map((option) => `
            <div class="wa-ingredient" data-opt="${option}">${option}-</div>
          `).join('')}
        </div>

        <div id="wa-feedback" class="alchemy-feedback"></div>

        <div id="wa-cauldron" class="alchemy-cauldron">
          ${Array.from({ length: 8 }).map(() => `
            <span
              class="alchemy-bubble"
              style="--bubble-x:${18 + Math.random() * 64}%; --bubble-delay:${Math.random() * 3}s;"
            ></span>
          `).join('')}
          <div class="alchemy-cauldron-label">Kessel der Wörter</div>
        </div>
      `;

      const ingredients = wrapper.querySelectorAll('.wa-ingredient');
      const cauldron = wrapper.querySelector('#wa-cauldron');
      const feedback = wrapper.querySelector('#wa-feedback');
      let dragState = null;

      const onPointerMove = (e) => {
        if (!dragState || dragState.pointerId !== e.pointerId) {
          return;
        }

        const { ingredient, startX, startY } = dragState;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        ingredient.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx / 12}deg)`;

        const cauldronRect = cauldron.getBoundingClientRect();
        const ingredientRect = ingredient.getBoundingClientRect();
        const isOverCauldron =
          ingredientRect.left < cauldronRect.right &&
          ingredientRect.right > cauldronRect.left &&
          ingredientRect.top < cauldronRect.bottom &&
          ingredientRect.bottom > cauldronRect.top;

        cauldron.classList.toggle('hover', isOverCauldron);
      };

      const onPointerUp = (e) => {
        if (!dragState || dragState.pointerId !== e.pointerId) {
          return;
        }

        const { ingredient } = dragState;
        const cauldronRect = cauldron.getBoundingClientRect();
        const ingredientRect = ingredient.getBoundingClientRect();
        const isOverCauldron =
          ingredientRect.left < cauldronRect.right &&
          ingredientRect.right > cauldronRect.left &&
          ingredientRect.top < cauldronRect.bottom &&
          ingredientRect.bottom > cauldronRect.top;

        ingredient.classList.remove('dragging');
        ingredient.releasePointerCapture?.(e.pointerId);

        if (isOverCauldron) {
          if (ingredient.dataset.opt === goal.answer) {
            ingredient.style.display = 'none';
            cauldron.classList.remove('fail', 'hover');
            cauldron.classList.add('success');
            feedback.classList.add('show');
            feedback.innerHTML = `Goldwort!<small>${goal.full}</small>`;
            SoundManager.play('success');
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            setTimeout(() => onComplete({ correct: true, score: 100 }), 1400);
          } else {
            ingredient.style.transform = 'translate(0, 0)';
            cauldron.classList.remove('success', 'hover');
            cauldron.classList.add('fail');
            SoundManager.play('error');
            setTimeout(() => cauldron.classList.remove('fail'), 420);
          }
        } else {
          ingredient.style.transform = 'translate(0, 0)';
          cauldron.classList.remove('hover');
        }

        dragState = null;
      };

      ingredients.forEach((ingredient) => {
        ingredient.addEventListener('pointerdown', (e) => {
          dragState = {
            ingredient,
            startX: e.clientX,
            startY: e.clientY,
            pointerId: e.pointerId
          };
          ingredient.classList.add('dragging');
          ingredient.style.zIndex = '20';
          ingredient.setPointerCapture?.(e.pointerId);
          SoundManager.play('whoosh');
        });
      });

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      container.appendChild(wrapper);
    }

    render();
  }
};
