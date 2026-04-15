/**
 * Mini-Game: Proverb Path (Sprichwort-Pfad)
 * Complete the German proverb.
 */
export const ProverbPath = {
  id: 'proverb-path',
  name_de: 'Sprichwort-Pfad',
  topics: ['lesen', 'wortschatz'],
  setup(container, task, onComplete) {
    const data = [
      { start: 'Morgenstund hat Gold im ___', answer: 'Mund', options: ['Mund', 'Hand', 'Kopf', 'Haus'] },
      { start: 'Wer rastet, der ___', answer: 'rostet', options: ['rostet', 'schläft', 'läuft', 'lacht'] }
    ];
    const item = data[Math.floor(Math.random() * data.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:15px;">🛣️</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Vervollständige das Sprichwort!</p>
        <div style="font-size:1.4rem;background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:30px;font-style:italic;">"${item.start}"</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${item.options.sort(() => Math.random() - 0.5).map(o => `<button class="pp-btn" data-o="${o}" style="padding:15px;background:#e67e22;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">${o}</button>`).join('')}
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
