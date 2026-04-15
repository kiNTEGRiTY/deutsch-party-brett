/**
 * Mini-Game: Fill the Poem (Gedicht-Lücke)
 * Complete the rhyming poem by choosing the last word of each verse.
 */
export const FillThePoem = {
  id: 'fill-the-poem',
  name_de: 'Gedicht-Lücke',
  topics: ['reime', 'lesen', 'wortschatz'],
  setup(container, task, onComplete) {
    const poems = [
      {
        lines: [
          { text: 'Im Garten blüht eine rote', blank: false },
          { text: '___', blank: true, answer: 'Rose', options: ['Rose', 'Nase', 'Dose', 'Hose'] },
          { text: 'Und neben ihr sitzt eine weiße', blank: false },
          { text: '___', blank: true, answer: 'Gans', options: ['Gans', 'Hans', 'Tanz', 'Glanz'] }
        ]
      },
      {
        lines: [
          { text: 'Der Hund liegt faul im', blank: false },
          { text: '___', blank: true, answer: 'Gras', options: ['Gras', 'Fass', 'Spaß', 'Maß'] },
          { text: 'Und träumt von einem großen', blank: false },
          { text: '___', blank: true, answer: 'Knochen', options: ['Knochen', 'Wochen', 'Kochen', 'Pochen'] }
        ]
      }
    ];
    const poem = poems[Math.floor(Math.random() * poems.length)];
    const blanks = poem.lines.filter(l => l.blank);
    let blankIdx = 0, score = 0;
    const answers = {};

    function renderPoem() {
      if (blankIdx >= blanks.length) {
        const poemDisplay = poem.lines.map(l => l.blank
          ? `<span style="background:#2ecc71;color:white;padding:2px 8px;border-radius:6px;font-weight:bold;">${answers[l.answer] || l.answer}</span>`
          : `<span>${l.text}</span>`
        ).join('<br>');
        container.innerHTML = `<div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:10px;">📜🎉</div>
          <div style="font-size:1.3rem;line-height:2.2;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;">${poemDisplay}</div>
        </div>`;
        setTimeout(() => onComplete({ correct: score === blanks.length, score: Math.round((score/blanks.length)*100) }), 1500);
        return;
      }

      const currentBlank = blanks[blankIdx];
      const displayLines = poem.lines.map(l => {
        if (l.blank) {
          const filled = answers[l.answer];
          if (filled) return `<span style="background:#2ecc71;color:white;padding:2px 8px;border-radius:6px;">${filled}</span>`;
          if (l === currentBlank) return `<span style="border-bottom:3px dashed #e74c3c;color:#e74c3c;padding:0 20px;font-size:1.1rem;">___</span>`;
          return `<span style="border-bottom:2px solid #bdc3c7;padding:0 15px;">&nbsp;&nbsp;&nbsp;</span>`;
        }
        return `<span>${l.text}</span>`;
      }).join('<br>');

      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:10px;">📜</div>
          <div style="font-size:1.3rem;line-height:2.5;background:rgba(255,255,255,.8);padding:20px;border-radius:12px;margin-bottom:20px;">${displayLines}</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;">
            ${currentBlank.options.map(o=>`<button class="fp-btn" data-o="${o}" style="padding:10px 18px;font-size:1.1rem;border-radius:20px;border:none;cursor:pointer;background:#9b59b6;color:white;font-weight:bold;box-shadow:0 3px 0 #8e44ad;">${o}</button>`).join('')}
          </div>
        </div>`;

      container.querySelectorAll('.fp-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.fp-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === currentBlank.answer;
          btn.style.background = correct?'#2ecc71':'#e74c3c'; btn.style.boxShadow='none';
          if(!correct){const c=[...container.querySelectorAll('.fp-btn')].find(b=>b.dataset.o===currentBlank.answer);if(c)c.style.background='#2ecc71',c.style.boxShadow='none';}
          if(correct){score++;answers[currentBlank.answer]=currentBlank.answer;}
          else{answers[currentBlank.answer]=currentBlank.options.find(o=>o!==currentBlank.answer)||currentBlank.answer;}
          blankIdx++;
          setTimeout(renderPoem, 1000);
        });
      });
    }
    renderPoem();
  }
};
