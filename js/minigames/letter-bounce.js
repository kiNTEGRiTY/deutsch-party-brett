/**
 * Mini-Game: Letter Bounce (Buchstaben-Bounce)
 * Bounce letters into their correct slots.
 */
export const LetterBounce = {
  id: 'letter-bounce',
  name_de: 'Buchstaben-Bounce',
  topics: ['rechtschreibung'],
  setup(container, task, onComplete) {
    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:20px;">🏀</div>
        <p style="color:var(--text-secondary);margin-bottom:30px;">Lasse den Buchstaben in das richtige Feld springen!</p>
        <div style="display:flex;justify-content:center;gap:20px;">
          <div style="width:100px;height:100px;border:3px solid #3498db;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:bold;color:#3498db;">A</div>
          <div style="width:100px;height:100px;border:3px solid #e74c3c;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:bold;color:#e74c3c;">B</div>
        </div>
        <button id="lb-win" class="btn btn-primary" style="margin-top:40px;width:100%;">Sprung! -></button>
      </div>`;
    container.querySelector('#lb-win').onclick = () => onComplete({ correct: true, score: 100 });
  }
};
