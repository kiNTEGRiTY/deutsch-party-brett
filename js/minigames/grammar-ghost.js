/**
 * Mini-Game: Grammar Ghost (Grammatik-Gespenst)
 * Fix the grammar error in the sentence.
 */
export const GrammarGhost = {
  id: 'grammar-ghost',
  name_de: 'Grammatik-Gespenst',
  topics: ['grammatik', 'rechtschreibung'],
  setup(container, task, onComplete) {
    const examples = [
      { wrong: 'Ich gehe in die Haus.', right: 'Ich gehe in das Haus.', hint: 'Artikel falsch?' },
      { wrong: 'Er lauft schnell.', right: 'Er läuft schnell.', hint: 'Vokal falsch?' }
    ];
    const ex = examples[Math.floor(Math.random() * examples.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
        <div style="font-size:3rem;margin-bottom:15px;">👻</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Das Gespenst hat einen Fehler gemacht! Korrigiere den Satz:</p>
        <div style="font-size:1.3rem;background:#f8f9fa;padding:15px;border-radius:8px;margin-bottom:20px;color:#e74c3c;font-style:italic;">"${ex.wrong}"</div>
        <input id="gg-input" type="text" placeholder="Richtiger Satz..." style="width:100%;padding:15px;font-size:1.2rem;border-radius:10px;border:2px solid #34495e;outline:none;">
        <button id="gg-submit" class="btn btn-primary" style="margin-top:15px;width:100%;">Geist bannen!</button>
      </div>`;

    container.querySelector('#gg-submit').onclick = () => {
      const val = container.querySelector('#gg-input').value.trim();
      const correct = val.toLowerCase() === ex.right.toLowerCase();
      onComplete({ correct, score: correct ? 100 : 0 });
    };
  }
};
