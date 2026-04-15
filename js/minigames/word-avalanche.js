/**
 * Mini-Game: Word Avalanche (Wort-Lawine)
 * Words slide down in rows. Tap ALL correct ones before they pile up.
 */
export const WordAvalanche = {
  id: 'word-avalanche',
  name_de: 'Wort-Lawine',
  topics: ['wortschatz', 'nomen', 'adjektive'],
  setup(container, task, onComplete) {
    // The challenge: find all NOUNS. Target = Nomen.
    const nounPool = ['Hund', 'Haus', 'Baum', 'Katze', 'Auto', 'Kind', 'Buch', 'Sonne'];
    const verbPool = ['laufen', 'essen', 'singen', 'schlafen', 'trinken', 'rennen'];
    const adjPool = ['groß', 'klein', 'laut', 'schnell', 'heiß'];
    const ROUNDS = 4;
    let round = 0, score = 0;

    function buildRow() {
      const isTarget = idx => words[idx].type === 'noun';
      const nouns = nounPool.sort(()=>Math.random()-.5).slice(0,2);
      const others = [...verbPool, ...adjPool].sort(()=>Math.random()-.5).slice(0,3);
      const words = [
        ...nouns.map(w=>({word:w, type:'noun'})),
        ...others.map(w=>({word:w, type:'other'}))
      ].sort(()=>Math.random()-.5);
      return words;
    }

    function renderRound() {
      if (round >= ROUNDS) { onComplete({ correct: score>=ROUNDS*0.6, score: Math.round((score/ROUNDS)*100) }); return; }
      const words = buildRow();
      const chosen = new Set();

      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="color:#3498db;font-weight:bold;">Runde ${round+1}/${ROUNDS}</span>
            <span style="color:#27ae60;font-weight:bold;">Score: ${score}</span>
          </div>
          <p style="color:var(--text-secondary);margin-bottom:15px;">Markiere alle <b style="color:#e74c3c;">Nomen</b>!</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:20px;">
            ${words.map((w,i)=>`<div class="av-word" data-idx="${i}" data-type="${w.type}" style="padding:10px 18px;border-radius:20px;font-size:1.1rem;font-weight:bold;cursor:pointer;background:#ecf0f1;color:#2c3e50;border:2px solid transparent;transition:all .15s;">${w.word}</div>`).join('')}
          </div>
          <button id="av-submit" class="btn btn-primary" style="width:100%;max-width:250px;">Bestätigen ✓</button>
        </div>`;

      container.querySelectorAll('.av-word').forEach(el => {
        el.addEventListener('click', () => {
          const i = el.dataset.idx;
          if (chosen.has(i)) { chosen.delete(i); el.style.background='#ecf0f1'; el.style.borderColor='transparent'; el.style.color='#2c3e50'; }
          else { chosen.add(i); el.style.background='#e74c3c'; el.style.borderColor='#c0392b'; el.style.color='white'; }
        });
      });

      container.querySelector('#av-submit').addEventListener('click', () => {
        container.querySelectorAll('.av-word').forEach(el => el.style.pointerEvents='none');
        let rndScore = 0;
        container.querySelectorAll('.av-word').forEach(el => {
          const isNoun = el.dataset.type === 'noun';
          const wasTapped = chosen.has(el.dataset.idx);
          if (isNoun) el.style.border='2px solid #2ecc71';
          if (wasTapped && isNoun) { rndScore++; el.style.background='#2ecc71'; el.style.color='white'; }
          else if (wasTapped && !isNoun) { el.style.background='#e74c3c'; }
          else if (!wasTapped && isNoun) { el.style.background='#f39c12'; el.style.color='white'; }
        });
        const nounCount = words.filter(w=>w.type==='noun').length;
        if (rndScore === nounCount) score++;
        round++;
        setTimeout(renderRound, 1400);
      });
    }
    renderRound();
  }
};
