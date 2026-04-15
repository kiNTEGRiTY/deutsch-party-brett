/**
 * Mini-Game: Story Builder (Geschichte-Baumeister)
 * Fill blanks in a mini-story by tapping word tiles in order.
 */
export const StoryBuilder = {
  id: 'story-builder',
  name_de: 'Geschichte-Baumeister',
  topics: ['lesen', 'wortschatz', 'satzbau'],
  setup(container, task, onComplete) {
    const stories = [
      {
        template: 'Der {TIER} lief durch den {ORT}. Er war sehr {ADJ}.',
        blanks: { TIER: 'Hund', ORT: 'Garten', ADJ: 'glücklich' },
        pools: { TIER: ['Hund', 'Tisch', 'Stern'], ORT: ['Garten', 'Schule', 'Himmel'], ADJ: ['glücklich', 'grün', 'laut'] }
      },
      {
        template: 'Die {TIER} saß auf dem {ORT} und schlief {ADJ}.',
        blanks: { TIER: 'Katze', ORT: 'Stuhl', ADJ: 'tief' },
        pools: { TIER: ['Katze', 'Baum', 'Sonne'], ORT: ['Stuhl', 'Wolke', 'Auto'], ADJ: ['tief', 'hoch', 'schnell'] }
      }
    ];
    const s = stories[Math.floor(Math.random() * stories.length)];
    const blankKeys = Object.keys(s.blanks);
    const userAnswers = {};
    let currentBlankIdx = 0;

    function render() {
      const currentKey = blankKeys[currentBlankIdx];
      let displayText = s.template;
      blankKeys.forEach(k => {
        const val = userAnswers[k] || `[${k}]`;
        const color = userAnswers[k] ? '#2ecc71' : '#e74c3c';
        displayText = displayText.replace(`{${k}}`, `<b style="color:${color};border-bottom:2px solid ${color};">${val}</b>`);
      });

      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:10px;">📖</div>
          <div style="font-size:1.3rem;line-height:2;background:rgba(255,255,255,0.8);padding:20px;border-radius:12px;margin-bottom:25px;color:#2c3e50;">
            ${displayText}
          </div>
          ${currentBlankIdx < blankKeys.length ? `
            <p style="color:var(--text-secondary);margin-bottom:15px;">Was passt für <b>[${currentKey}]</b>?</p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
              ${s.pools[currentKey].map(opt=>`<button class="sb-btn" data-opt="${opt}" style="padding:12px 20px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#9b59b6;color:white;font-weight:bold;box-shadow:0 4px 0 #8e44ad;">${opt}</button>`).join('')}
            </div>
          ` : `<div style="font-size:1.5rem;color:#2ecc71;">Geschichte fertig! 🎉</div>`}
        </div>`;

      container.querySelectorAll('.sb-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isCorrect = btn.dataset.opt === s.blanks[currentKey];
          btn.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
          btn.style.boxShadow = 'none';
          container.querySelectorAll('.sb-btn').forEach(b => b.style.pointerEvents = 'none');
          if (isCorrect) { userAnswers[currentKey] = btn.dataset.opt; }
          setTimeout(() => {
            currentBlankIdx++;
            if (currentBlankIdx >= blankKeys.length) {
              const allCorrect = blankKeys.every(k => userAnswers[k] === s.blanks[k]);
              setTimeout(() => onComplete({ correct: allCorrect, score: allCorrect ? 100 : Math.round((Object.keys(userAnswers).length / blankKeys.length) * 50) }), 1200);
            }
            render();
          }, 900);
        });
      });
    }
    render();
  }
};
