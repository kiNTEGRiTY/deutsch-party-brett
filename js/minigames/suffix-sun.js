/**
 * Mini-Game: Suffix Sun (Suffix-Sonne)
 * Choose the correct suffix to form a noun or adjective.
 */
export const SuffixSun = {
  id: 'suffix-sun',
  name_de: 'Suffix-Sonne',
  topics: ['wortarten', 'grammatik'],
  setup(container, task, onComplete) {
    const data = [
      { base: 'Kind', answer: 'heit', options: ['heit', 'ung', 'keit', 'schaft'], result: 'Kindheit' },
      { base: 'freund', answer: 'lich', options: ['lich', 'ig', 'bar', 'sam'], result: 'freundlich' }
    ];
    const item = data[Math.floor(Math.random() * data.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:15px;">☀️</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Welches Suffix passt zu <b>${item.base}</b>?</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          ${item.options.sort(() => Math.random() - 0.5).map(o => `<button class="ss-btn" data-o="${o}" style="padding:15px;background:#f1c40f;color:#2c3e50;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">-${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.ss-btn').forEach(btn => {
      btn.onclick = () => {
        const correct = btn.dataset.o === item.answer;
        onComplete({ correct, score: correct ? 100 : 0 });
      };
    });
  }
};
