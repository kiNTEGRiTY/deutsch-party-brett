/**
 * Mini-Game: Split the Word (Komposita-Säger)
 * Split a compound word into its component parts by tapping the split point.
 */
export const SplitTheWord = {
  id: 'split-the-word',
  name_de: 'Komposita-Säger',
  topics: ['zusammengesetzte_nomen', 'rechtschreibung'],
  setup(container, task, onComplete) {
    const words = [
      { word: 'Sonnenblume', parts: ['Sonnen', 'blume'], splitIdx: 6 },
      { word: 'Hausschlüssel', parts: ['Haus', 'schlüssel'], splitIdx: 4 },
      { word: 'Apfelbaum', parts: ['Apfel', 'baum'], splitIdx: 5 },
      { word: 'Schulkind', parts: ['Schul', 'kind'], splitIdx: 5 },
      { word: 'Blumentopf', parts: ['Blumen', 'topf'], splitIdx: 6 }
    ];

    const wrd = words[Math.floor(Math.random() * words.length)];
    let selectedSplit = null;

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:5px;">🪚</div>
          <p style="color:var(--text-secondary);margin-bottom:20px;">Wo teilt sich das Wort auf? Tippe auf die Stelle!</p>
          
          <div id="sw-word-display" style="display:flex;justify-content:center;align-items:center;font-size:2.5rem;font-weight:900;font-family:'Fredoka One',cursive;margin-bottom:30px;gap:0;flex-wrap:nowrap;overflow:hidden;">
            ${[...wrd.word].map((ch, i) => `
              <div class="sw-char" data-before="${i}" style="position:relative;cursor:pointer;padding:5px 2px;border-radius:4px;transition:background .15s;">${ch}${i < wrd.word.length-1 ? `<span class="sw-sep" data-sep="${i+1}" style="position:absolute;top:0;right:-2px;width:4px;height:100%;background:${selectedSplit===i+1?'#e74c3c':'transparent'};border-radius:2px;cursor:pointer;transition:background .15s;"></span>` : ''}</div>
            `).join('')}
          </div>

          ${selectedSplit !== null ? `
            <div style="margin-bottom:20px;font-size:1.3rem;">
              <span style="background:#3498db;color:white;padding:6px 14px;border-radius:20px;margin-right:5px;">${wrd.word.slice(0, selectedSplit)}</span>
              +
              <span style="background:#e74c3c;color:white;padding:6px 14px;border-radius:20px;margin-left:5px;">${wrd.word.slice(selectedSplit)}</span>
            </div>
            <button id="sw-confirm" class="btn btn-primary" style="width:200px;">Bestätigen ✓</button>
          ` : `<p style="color:#7f8c8d;font-size:.9rem;">Tippe zwischen zwei Buchstaben, um zu teilen</p>`}
        </div>`;

      container.querySelectorAll('.sw-sep, .sw-char').forEach(el => {
        el.addEventListener('click', () => {
          const sep = el.dataset.sep || el.dataset.before;
          if (sep) { selectedSplit = parseInt(sep); render(); }
        });
      });

      container.querySelector('#sw-confirm')?.addEventListener('click', () => {
        const correct = selectedSplit === wrd.splitIdx;
        container.querySelector('#sw-confirm').style.background = correct ? '#2ecc71' : '#e74c3c';
        if (!correct) {
          // Show correct split
          const parts = container.querySelectorAll('.sw-char');
          if (parts[wrd.splitIdx - 1]) { parts[wrd.splitIdx - 1].querySelector('.sw-sep')?.setAttribute('style', 'position:absolute;top:0;right:-2px;width:4px;height:100%;background:#2ecc71;border-radius:2px;'); }
        }
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1300);
      });
    }
    render();
  }
};
