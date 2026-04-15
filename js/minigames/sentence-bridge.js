/**
 * Mini-Game: Sentence Bridge (Satz-Brücke)
 * Connect sentence fragments to build a bridge.
 */
export const SentenceBridge = {
  id: 'sentence-bridge',
  name_de: 'Satz-Brücke',
  topics: ['satzbau'],
  setup(container, task, onComplete) {
    const data = { left: 'Ich gehe', right: 'nach Hause.' };
    
    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <p style="color:var(--text-secondary);margin-bottom:30px;">Verbinde die Satzteile!</p>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div style="background:#3498db;color:white;padding:15px;border-radius:10px;font-weight:bold;">${data.left}</div>
          <div style="font-size:2rem;">🔗</div>
          <div style="background:#3498db;color:white;padding:15px;border-radius:10px;font-weight:bold;">${data.right}</div>
        </div>
        <button id="sb-win" class="btn btn-primary" style="margin-top:40px;width:100%;">Brücke fertig! -></button>
      </div>`;
    container.querySelector('#sb-win').onclick = () => onComplete({ correct: true, score: 100 });
  }
};
