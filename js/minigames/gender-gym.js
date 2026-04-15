/**
 * Mini-Game: Gender Gym (Genus-Training)
 * Rapidly assign the correct article (der, die, das) to words.
 */
export const GenderGym = {
  id: 'gender-gym',
  name_de: 'Genus-Training',
  topics: ['artikel'],
  setup(container, task, onComplete) {
    const words = [
      { w: 'Hund', g: 'der' },
      { w: 'Katze', g: 'die' },
      { w: 'Haus', g: 'das' },
      { w: 'Baum', g: 'der' },
      { w: 'Sonne', g: 'die' },
      { w: 'Auto', g: 'das' }
    ].sort(() => Math.random() - 0.5);
    let idx = 0, score = 0;

    function render() {
      if (idx >= words.length) {
        onComplete({ correct: score > 3, score: Math.round((score/words.length)*100) });
        return;
      }
      const item = words[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:3rem;font-weight:900;color:#2c3e50;margin-bottom:40px;">${item.w}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
            <button class="gg-btn" data-g="der" style="padding:20px;background:#3498db;color:white;font-weight:bold;border:none;border-radius:10px;cursor:pointer;box-shadow:0 5px 0 #2980b9;">der</button>
            <button class="gg-btn" data-g="die" style="padding:20px;background:#e74c3c;color:white;font-weight:bold;border:none;border-radius:10px;cursor:pointer;box-shadow:0 5px 0 #c0392b;">die</button>
            <button class="gg-btn" data-g="das" style="padding:20px;background:#2ecc71;color:white;font-weight:bold;border:none;border-radius:10px;cursor:pointer;box-shadow:0 5px 0 #27ae60;">das</button>
          </div>
        </div>`;

      container.querySelectorAll('.gg-btn').forEach(btn => {
        btn.onclick = () => {
          const correct = btn.dataset.g === item.g;
          if (correct) score++;
          idx++;
          render();
        };
      });
    }
    render();
  }
};
