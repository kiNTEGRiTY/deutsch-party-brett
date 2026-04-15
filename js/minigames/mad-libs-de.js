/**
 * Mini-Game: Mad Libs DE (Wort-Wahnsinn)
 * Fill in the blanks with specific word types to create a funny story.
 */
export const MadLibsDE = {
  id: 'mad-libs-de',
  name_de: 'Wort-Wahnsinn',
  topics: ['wortarten', 'kreativität'],
  setup(container, task, onComplete) {
    const templates = [
      { 
        text: 'Eines Tages sah ein [Adjektiv] [Nomen] ein [Nomen] und fing an zu [Verb].', 
        blanks: ['Adjektiv', 'Nomen', 'Nomen', 'Verb'] 
      }
    ];
    const t = templates[Math.floor(Math.random() * templates.length)];
    const answers = [];
    let currentBlank = 0;

    function render() {
      if (currentBlank >= t.blanks.length) {
        let finalStory = t.text;
        answers.forEach(a => { finalStory = finalStory.replace(/\[.*?\]/, `<b style="color:#e74c3c;">${a}</b>`); });
        container.innerHTML = `
          <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
            <div style="font-size:2.5rem;margin-bottom:15px;">🤣</div>
            <div style="font-size:1.4rem;background:rgba(255,255,255,0.8);padding:20px;border-radius:12px;margin-bottom:20px;line-height:1.8;">
              ${finalStory}
            </div>
            <button id="ml-done" class="btn btn-primary" style="width:100%;">Cool! Weiter -></button>
          </div>`;
        container.querySelector('#ml-done').onclick = () => onComplete({ correct: true, score: 100 });
        return;
      }

      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:1rem;color:var(--text-secondary);margin-bottom:10px;">Schritt ${currentBlank+1} von ${t.blanks.length}</div>
          <p style="font-size:1.5rem;font-weight:bold;color:#2c3e50;margin-bottom:25px;">Gib ein <span style="color:#3498db;">${t.blanks[currentBlank]}</span> ein:</p>
          <input id="ml-input" type="text" placeholder="Wort..." style="width:100%;padding:15px;font-size:1.5rem;text-align:center;border-radius:10px;border:2px solid #34495e;outline:none;">
          <button id="ml-next" class="btn btn-primary" style="margin-top:15px;width:100%;">Nächstes Wort</button>
        </div>`;

      const input = container.querySelector('#ml-input');
      input.focus();
      container.querySelector('#ml-next').onclick = () => {
        const val = input.value.trim();
        if (val) { answers.push(val); currentBlank++; render(); }
      };
    }
    render();
  }
};
