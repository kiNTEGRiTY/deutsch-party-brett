/**
 * Mini-Game: Comma King (Komma-König)
 * Tap where commas are needed in a sentence.
 */
export const CommaKing = {
  id: 'comma-king',
  name_de: 'Komma-König',
  topics: ['satzzeichen', 'grammatik'],
  setup(container, task, onComplete) {
    const examples = [
      { parts: ['Ich kaufe', 'Äpfel', 'Birnen', 'Orangen und Bananen.'], commas: [1, 2] },
      { parts: ['Er ist groß', 'stark und freundlich.'], commas: [1] },
      { parts: ['Wir essen', 'trinken', 'lachen und tanzen.'], commas: [1, 2] }
    ];
    const current = examples[Math.floor(Math.random() * examples.length)];
    const placed = new Set();

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:3rem;margin-bottom:5px;">👑</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Tippe auf die Stellen, wo Kommas fehlen!</p>
        <div id="ck-sentence" style="font-size:1.4rem;font-weight:bold;color:#2c3e50;background:rgba(255,255,255,0.8);padding:20px;border-radius:12px;border:2px solid #ecf0f1;line-height:2.4;margin-bottom:25px;"></div>
        <button id="ck-check" class="btn btn-primary btn-lg" style="width:100%;max-width:300px;">Überprüfen ✓</button>
      </div>`;

    const sentenceEl = container.querySelector('#ck-sentence');

    function render() {
      sentenceEl.innerHTML = '';
      current.parts.forEach((part, i) => {
        const span = document.createElement('span');
        span.textContent = part;
        sentenceEl.appendChild(span);
        if (i < current.parts.length - 1) {
          const slot = document.createElement('span');
          slot.dataset.idx = i + 1;
          slot.textContent = placed.has(i + 1) ? ',' : ' ';
          Object.assign(slot.style, {
            display: 'inline-block', minWidth: '20px', cursor: 'pointer', color: '#e74c3c',
            fontWeight: 'bold', fontSize: '1.6rem', padding: '0 2px',
            borderBottom: placed.has(i + 1) ? 'none' : '2px dashed #bdc3c7',
            transition: 'all 0.1s'
          });
          slot.addEventListener('click', () => {
            if (placed.has(i + 1)) placed.delete(i + 1); else placed.add(i + 1);
            render();
          });
          sentenceEl.appendChild(slot);
          sentenceEl.appendChild(document.createTextNode(' '));
        }
      });
    }
    render();

    container.querySelector('#ck-check').addEventListener('click', () => {
      const expected = new Set(current.commas);
      const isCorrect = [...placed].sort().join(',') === [...expected].sort().join(',');
      container.querySelector('#ck-check').style.background = isCorrect ? '#2ecc71' : '#e74c3c';
      container.querySelector('#ck-check').textContent = isCorrect ? 'Perfekt! 🎉' : 'Falsch! ❌';
      setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1400);
    });
  }
};
