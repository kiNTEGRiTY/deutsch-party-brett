/**
 * Mini-Game: Prefix Power (Präfix-Power)
 * Choose the correct prefix for the base verb.
 */
export const PrefixPower = {
  id: 'prefix-power',
  name_de: 'Präfix-Power',
  topics: ['verben', 'grammatik'],
  setup(container, task, onComplete) {
    const data = [
      { base: 'stellen', answer: 'vor', options: ['vor', 'be', 'ge', 'ent'], result: 'vorstellen' },
      { base: 'gehen', answer: 'aus', options: ['aus', 'unter', 'mit', 'nach'], result: 'ausgehen' }
    ];
    const item = data[Math.floor(Math.random() * data.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:15px;">⚡</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Welches Präfix bildet ein sinnvolles Verb mit <b>${item.base}</b>?</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${item.options.sort(() => Math.random() - 0.5).map(o => `<button class="pp-btn" data-o="${o}" style="padding:15px;background:#9b59b6;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">${o}-</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.pp-btn').forEach(btn => {
      btn.onclick = () => {
        const correct = btn.dataset.o === item.answer;
        onComplete({ correct, score: correct ? 100 : 0 });
      };
    });
  }
};
