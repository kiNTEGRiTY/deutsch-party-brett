/**
 * Mini-Game: Image Word Match (Emoji-Wort-Zuordnung)
 * Match emoji-icons to their German words by connecting them.
 */
export const ImageWordMatch = {
  id: 'image-word-match',
  name_de: 'Bild-Wort-Spiel',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const pairs = [
      { emoji: '🐕', word: 'Hund' }, { emoji: '🌳', word: 'Baum' },
      { emoji: '🚗', word: 'Auto' }, { emoji: '📚', word: 'Bücher' },
      { emoji: '☀️', word: 'Sonne' }, { emoji: '🏠', word: 'Haus' }
    ];
    const selected = [...pairs].sort(() => Math.random() - 0.5).slice(0, 4);
    const shuffledWords = [...selected.map(p=>p.word)].sort(() => Math.random() - 0.5);
    const matched = new Map();
    let selectedEmoji = null;

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <p style="color:var(--text-secondary);margin-bottom:20px;">Verbinde Bilder mit den Wörtern!</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
            <!-- Emojis left -->
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${selected.map(p=>{
                const isMatched=[...matched.keys()].includes(p.emoji);
                const isSelected=selectedEmoji===p.emoji;
                return `<div class="emoji-item" data-emoji="${p.emoji}" style="height:60px;display:flex;align-items:center;justify-content:center;font-size:2rem;border-radius:12px;cursor:pointer;background:${isMatched?'#2ecc71':isSelected?'#f1c40f':'white'};border:3px solid ${isMatched?'#27ae60':isSelected?'#e67e22':'#ecf0f1'};box-shadow:0 2px 5px rgba(0,0,0,.1);${isMatched?'opacity:.6':''};">${p.emoji}</div>`;
              }).join('')}
            </div>
            <!-- Words right -->
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${shuffledWords.map(w=>{
                const isMatched=[...matched.values()].includes(w);
                return `<div class="word-item" data-word="${w}" style="height:60px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:bold;border-radius:12px;cursor:pointer;background:${isMatched?'#2ecc71':'#ecf0f1'};color:${isMatched?'white':'#2c3e50'};border:3px solid ${isMatched?'#27ae60':'transparent'};${isMatched?'opacity:.6':''};">${w}</div>`;
              }).join('')}
            </div>
          </div>
          <div id="iwm-feedback" style="margin-top:15px;font-weight:bold;min-height:24px;"></div>
        </div>`;

      container.querySelectorAll('.emoji-item').forEach(el => {
        el.addEventListener('click', () => {
          if ([...matched.keys()].includes(el.dataset.emoji)) return;
          selectedEmoji = el.dataset.emoji;
          render();
        });
      });

      container.querySelectorAll('.word-item').forEach(el => {
        el.addEventListener('click', () => {
          if (!selectedEmoji || [...matched.values()].includes(el.dataset.word)) return;
          const expectedWord = selected.find(p => p.emoji === selectedEmoji)?.word;
          const fb = container.querySelector('#iwm-feedback');
          if (el.dataset.word === expectedWord) {
            matched.set(selectedEmoji, el.dataset.word);
            fb.textContent='✅ Richtig!'; fb.style.color='#2ecc71';
          } else {
            fb.textContent='❌ Nicht ganz!'; fb.style.color='#e74c3c';
          }
          selectedEmoji = null;
          render();
          if (matched.size === selected.length) {
            setTimeout(() => onComplete({ correct: true, score: 100 }), 700);
          }
        });
      });
    }
    render();
  }
};
