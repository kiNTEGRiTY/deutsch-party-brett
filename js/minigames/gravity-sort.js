/**
 * Mini-Game: Gravity Sort (Schwerkraft-Sortieren)
 * Catch falling words and put them in the correct bucket.
 */
export const GravitySort = {
  id: 'gravity-sort',
  name_de: 'Schwerkraft-Sortieren',
  topics: ['nomen', 'verben', 'adjektive'],
  setup(container, task, onComplete) {
    const pools = {
      nomen: ['Hund', 'Haus', 'Baum', 'Auto'],
      verben: ['laufen', 'essen', 'sehen', 'gehen']
    };
    const words = [...pools.nomen, ...pools.verben].sort(() => Math.random() - 0.5);
    let idx = 0, score = 0;

    function spawnNext() {
      if (idx >= words.length) {
        onComplete({ correct: score > 2, score: Math.round((score/words.length)*100) });
        return;
      }
      const word = words[idx];
      container.innerHTML = `
        <div style="position:relative;width:100%;height:60vh;max-height:500px;background:#ecf0f1;border-radius:16px;overflow:hidden;user-select:none;">
          <div id="gs-word" style="position:absolute;top:20px;left:50%;transform:translateX(-50%);background:#34495e;color:white;padding:15px 30px;border-radius:30px;font-weight:bold;font-size:1.5rem;box-shadow:0 5px 15px rgba(0,0,0,0.2);cursor:grab;">${word}</div>
          <div style="position:absolute;bottom:0;width:100%;display:flex;height:120px;">
            <div class="gs-bucket" data-type="nomen" style="flex:1;background:#3498db;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:1.2rem;border-top:5px solid #2980b9;">NOMEN</div>
            <div class="gs-bucket" data-type="verben" style="flex:1;background:#e67e22;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:1.2rem;border-top:5px solid #d35400;">VERBEN</div>
          </div>
        </div>`;

      const wordEl = container.querySelector('#gs-word');
      wordEl.addEventListener('click', (e) => {
        // Simple tap selection for this version
      });
      
      container.querySelectorAll('.gs-bucket').forEach(b => {
        b.onclick = () => {
          const type = b.dataset.type;
          const isCorrect = pools[type].includes(word);
          if (isCorrect) score++;
          b.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
          setTimeout(() => { idx++; spawnNext(); }, 600);
        };
      });
    }
    spawnNext();
  }
};
