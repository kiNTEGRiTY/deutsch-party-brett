/**
 * Mini-Game: Word Balloon (Wort-Ballon)
 * Pop balloons to collect letters for a word.
 */
export const WordBalloon = {
  id: 'word-balloon',
  name_de: 'Wort-Ballon',
  topics: ['rechtschreibung'],
  setup(container, task, onComplete) {
    const letters = ['H', 'A', 'N', 'D'];
    let collected = '';

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:3rem;margin-bottom:10px;">🎈</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Platze die Buchstaben für <b>HAND</b>!</p>
        <div style="display:flex;gap:15px;justify-content:center;">
          ${letters.map(l => `<button class="wb-btn" data-l="${l}" style="width:60px;height:80px;background:#e74c3c;color:white;border:none;border-radius:30px;font-weight:bold;font-size:1.5rem;cursor:pointer;box-shadow:0 5px 0 #c0392b;">${l}</button>`).join('')}
        </div>
        <div id="wb-res" style="margin-top:30px;font-size:1.5rem;font-weight:bold;color:#3498db;"></div>
      </div>`;

    container.querySelectorAll('.wb-btn').forEach(btn => {
      btn.onclick = () => {
        collected += btn.dataset.l;
        btn.style.opacity = '0.3';
        btn.style.pointerEvents = 'none';
        container.querySelector('#wb-res').textContent = collected;
        if (collected === 'HAND') setTimeout(() => onComplete({ correct: true, score: 100 }), 800);
      };
    });
  }
};
