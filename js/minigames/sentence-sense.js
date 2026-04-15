/**
 * Mini-Game: Sentence Sense (Satz-Sinn)
 * Does this sentence make sense? Logical comprehension check.
 */
export const SentenceSense = {
  id: 'sentence-sense',
  name_de: 'Satz-Sinn',
  topics: ['lesen', 'satzbau'],
  setup(container, task, onComplete) {
    const sentences = [
      { text: 'Der Hund bellt laut.', sensible: true },
      { text: 'Die Katze fährt ein Auto.', sensible: false },
      { text: 'Das Kind liest ein Buch.', sensible: true },
      { text: 'Der Baum isst Apfelkuchen.', sensible: false },
      { text: 'Die Sonne scheint hell.', sensible: true },
      { text: 'Das Buch schwimmt im See.', sensible: false }
    ];
    const selected = [...sentences].sort(() => Math.random() - 0.5).slice(0, 4);
    let idx = 0, score = 0;

    function renderRound() {
      const s = selected[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:10px;">🤔</div>
          <p style="color:var(--text-secondary);margin-bottom:5px;">${idx+1}/${selected.length}</p>
          <p style="color:var(--text-secondary);margin-bottom:20px;font-size:.9rem;">Macht dieser Satz Sinn?</p>
          <div style="font-size:1.5rem;font-weight:bold;color:#2c3e50;background:rgba(255,255,255,0.8);padding:25px;border-radius:12px;border:2px solid #ecf0f1;margin-bottom:30px;line-height:1.6;">
            "${s.text}"
          </div>
          <div style="display:flex;gap:20px;justify-content:center;">
            <button class="ss-btn" data-ans="true" style="width:130px;height:80px;border-radius:16px;font-size:1.2rem;font-weight:bold;background:#2ecc71;color:white;border:none;box-shadow:0 6px 0 #27ae60;cursor:pointer;">
              👍 Ja!
            </button>
            <button class="ss-btn" data-ans="false" style="width:130px;height:80px;border-radius:16px;font-size:1.2rem;font-weight:bold;background:#e74c3c;color:white;border:none;box-shadow:0 6px 0 #c0392b;cursor:pointer;">
              👎 Nein!
            </button>
          </div>
        </div>`;
      container.querySelectorAll('.ss-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.ss-btn').forEach(b=>b.style.pointerEvents='none',b=>b.style.boxShadow='none');
          const answered = btn.dataset.ans === 'true';
          const correct = answered === s.sensible;
          btn.style.outline = '4px solid white';
          btn.style.transform = 'scale(1.1)';
          if (correct) score++;
          setTimeout(() => { idx++; idx>=selected.length ? onComplete({ correct: score>=2, score: Math.round((score/selected.length)*100) }) : renderRound(); }, 1000);
        });
      });
    }
    renderRound();
  }
};
