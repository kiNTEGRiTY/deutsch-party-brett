/**
 * Mini-Game: Vowel Vacuum (Vokal-Staubsauger)
 * Catch the missing vowels to complete the word.
 */
export const VowelVacuum = {
  id: 'vowel-vacuum',
  name_de: 'Vokal-Staubsauger',
  topics: ['rechtschreibung'],
  setup(container, task, onComplete) {
    const words = [
      { full: 'HAUS', missing: 'H__S', vowels: ['A', 'U'] },
      { full: 'BAUM', missing: 'B__M', vowels: ['A', 'U'] }
    ];
    const w = words[Math.floor(Math.random() * words.length)];
    let collected = [];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <p style="color:var(--text-secondary);margin-bottom:20px;">Sammle die fehlenden Vokale!</p>
        <div style="font-size:3rem;font-weight:900;letter-spacing:10px;color:#34495e;margin-bottom:40px;">${w.missing}</div>
        <div style="display:flex;gap:15px;justify-content:center;">
          ${['A', 'E', 'I', 'O', 'U'].map(v => `<button class="vv-btn" data-v="${v}" style="width:60px;height:60px;border-radius:50%;font-size:1.5rem;font-weight:bold;background:#1abc9c;color:white;border:none;cursor:pointer;box-shadow:0 4px 0 #16a085;">${v}</button>`).join('')}
        </div>
        <div id="vv-result" style="margin-top:30px;font-size:1.5rem;font-weight:bold;color:#2ecc71;min-height:30px;"></div>
      </div>`;

    container.querySelectorAll('.vv-btn').forEach(btn => {
      btn.onclick = () => {
        const v = btn.dataset.v;
        if (w.vowels.includes(v) && !collected.includes(v)) {
          collected.push(v);
          btn.style.background = '#27ae60';
          btn.style.pointerEvents = 'none';
          if (collected.length === w.vowels.length) {
            container.querySelector('#vv-result').textContent = `Super! ${w.full}`;
            setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
          }
        } else {
          btn.style.background = '#e74c3c';
          setTimeout(() => { if (btn.style.background === 'rgb(231, 76, 60)') btn.style.background = '#1abc9c'; }, 500);
        }
      };
    });
  }
};
