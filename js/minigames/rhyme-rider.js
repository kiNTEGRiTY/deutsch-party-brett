/**
 * Mini-Game: Rhyme Rider (Reim-Reiter)
 * Catch words that rhyme with the target word.
 */
export const RhymeRider = {
  id: 'rhyme-rider',
  name_de: 'Reim-Reiter',
  topics: ['reime'],
  setup(container, task, onComplete) {
    const target = 'Haus';
    const rhymes = ['Maus', 'Klaus', 'raus', 'Schmaus'];
    const others = ['Hund', 'Baum', 'Tisch', 'Stuhl'];
    const all = [...rhymes, ...others].sort(() => Math.random() - 0.5);
    let score = 0, collected = 0;

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <p style="color:var(--text-secondary);margin-bottom:15px;">Fange alle Wörter, die sich auf <b>${target}</b> reimen!</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
          ${all.map(w => `<button class="rr-word" data-w="${w}" style="padding:15px 25px;font-size:1.2rem;border-radius:15px;border:none;background:#f39c12;color:white;font-weight:bold;cursor:pointer;box-shadow:0 5px 0 #e67e22;">${w}</button>`).join('')}
        </div>
        <div id="rr-progress" style="margin-top:25px;font-size:1.1rem;font-weight:bold;color:#34495e;">Gefunden: 0/${rhymes.length}</div>
      </div>`;

    container.querySelectorAll('.rr-word').forEach(btn => {
      btn.onclick = () => {
        const w = btn.dataset.w;
        const isRhyme = rhymes.includes(w);
        if (isRhyme) {
          score++;
          collected++;
          btn.style.background = '#2ecc71';
          btn.style.pointerEvents = 'none';
          btn.style.boxShadow = 'none';
          container.querySelector('#rr-progress').textContent = `Gefunden: ${collected}/${rhymes.length}`;
          if (collected === rhymes.length) setTimeout(() => onComplete({ correct: true, score: 100 }), 800);
        } else {
          btn.style.background = '#e74c3c';
          setTimeout(() => { btn.style.background = '#f39c12'; }, 500);
        }
      };
    });
  }
};
