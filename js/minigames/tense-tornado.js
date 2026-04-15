/**
 * Mini-Game: Tense Tornado (Zeitformen-Tornado)
 * Quickly identify the tense of the given verb.
 */
export const TenseTornado = {
  id: 'tense-tornado',
  name_de: 'Zeitformen-Tornado',
  topics: ['zeitformen'],
  setup(container, task, onComplete) {
    const data = [
      { v: 'ich gehe', t: 'Präsens' },
      { v: 'ich ging', t: 'Präteritum' },
      { v: 'ich bin gegangen', t: 'Perfekt' }
    ];
    const item = data[Math.floor(Math.random() * data.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:15px;">🌪️</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Welche Zeitform ist das?</p>
        <div style="font-size:2.5rem;font-weight:900;color:#2c3e50;margin-bottom:30px;">${item.v}</div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${['Präsens', 'Präteritum', 'Perfekt'].map(o => `<button class="tt-btn" data-o="${o}" style="padding:15px;background:#34495e;color:white;border:none;border-radius:10px;font-weight:bold;cursor:pointer;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.tt-btn').forEach(btn => {
      btn.onclick = () => {
        const correct = btn.dataset.o === item.t;
        onComplete({ correct, score: correct ? 100 : 0 });
      };
    });
  }
};
