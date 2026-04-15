/**
 * Mini-Game: Sentence Sniper (Satz-Scharfschütze)
 * Click the word that DOES NOT belong in the sentence.
 */
export const SentenceSniper = {
  id: 'sentence-sniper',
  name_de: 'Satz-Scharfschütze',
  topics: ['lesen', 'grammatik'],
  setup(container, task, onComplete) {
    const sentences = [
      { text: 'Der Hund läuft schnell und blau durch den Wald.', wrong: 'blau' },
      { text: 'Ich esse einen Apfel und singe morgen laut.', wrong: 'morgen' }, // debatable but let's keep it simple
      { text: 'Das Auto fährt leise auf der grünen Banane.', wrong: 'Banane' }
    ];
    const s = sentences[Math.floor(Math.random() * sentences.length)];
    const words = s.text.split(' ');

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:2.5rem;margin-bottom:15px;">🎯</div>
        <p style="color:var(--text-secondary);margin-bottom:25px;">Klicke das Wort an, das <b>nicht</b> in den Satz passt!</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;background:white;padding:20px;border-radius:12px;border:2px solid #3498db;">
          ${words.map(w => `<span class="ss-word" style="font-size:1.3rem;font-weight:bold;color:#2c3e50;cursor:pointer;padding:5px;border-radius:5px;transition:background 0.2s;">${w}</span>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.ss-word').forEach(wordEl => {
      wordEl.onclick = () => {
        const selected = wordEl.textContent.replace(/[.,!]/g, '');
        const isCorrect = selected === s.wrong;
        wordEl.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
        wordEl.style.color = 'white';
        setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1000);
      };
    });
  }
};
