/**
 * Mini-Game: Compound Chain (Wort-Kette Komposita)
 * Build a chain of compound words by sharing parts.
 */
export const CompoundChain = {
  id: 'compound-chain',
  name_de: 'Komposita-Kette',
  topics: ['zusammengesetzte_nomen', 'wortschatz'],
  setup(container, task, onComplete) {
    const chains = [
      { start: 'Sonne', steps: [
        { stem: 'Sonne', answer: 'Sonnenblume', hint: 'Sonne + ?', options: ['Sonnenblume', 'Sonnenmond', 'Sonnenstein', 'Sonnensand'] },
        { stem: 'Blume', answer: 'Blumentopf', hint: 'Blume + ?', options: ['Blumenwiese', 'Blumentopf', 'Blumenbaum', 'Blumenhaus'] }
      ]},
      { start: 'Haus', steps: [
        { stem: 'Haus', answer: 'Hausschlüssel', hint: 'Haus + ?', options: ['Hausschlüssel', 'Hausdach', 'Haustür', 'Hauswand'] },
        { stem: 'Schlüssel', answer: 'Schlüsselbund', hint: 'Schlüssel + ?', options: ['Schlüsselbund', 'Schlüsselloch', 'Schlüsselkind', 'Schlüsselring'] }
      ]}
    ];
    const chain = chains[Math.floor(Math.random() * chains.length)];
    let stepIdx = 0, score = 0;

    function renderStep() {
      if (stepIdx >= chain.steps.length) {
        setTimeout(() => onComplete({ correct: score === chain.steps.length, score: Math.round((score/chain.steps.length)*100) }), 500);
        return;
      }
      const step = chain.steps[stepIdx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:2rem;margin-bottom:10px;">🔗</div>
          <p style="color:var(--text-secondary);margin-bottom:5px;">Schritt ${stepIdx+1}/${chain.steps.length}</p>
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:25px;">
            <div style="background:#3498db;color:white;padding:12px 20px;border-radius:20px;font-size:1.4rem;font-weight:bold;">${step.stem}</div>
            <div style="font-size:1.5rem;">+</div>
            <div style="background:rgba(255,255,255,0.5);border:2px dashed #bdc3c7;padding:12px 20px;border-radius:20px;font-size:1.4rem;color:#7f8c8d;">???</div>
            <div style="font-size:1.5rem;">=</div>
            <div style="background:rgba(255,255,255,0.3);border:2px dashed #3498db;padding:12px 20px;border-radius:20px;font-size:1.4rem;color:#7f8c8d;">${step.hint.replace('?','???')}</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${step.options.map(o=>`<button class="cc-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#9b59b6;color:white;font-weight:bold;box-shadow:0 4px 0 #8e44ad;">${o}</button>`).join('')}
          </div>
        </div>`;
      container.querySelectorAll('.cc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          container.querySelectorAll('.cc-btn').forEach(b => b.style.pointerEvents='none');
          const correct = btn.dataset.o === step.answer;
          btn.style.background = correct ? '#2ecc71' : '#e74c3c'; btn.style.boxShadow='none';
          if (!correct) { const c=container.querySelector(`.cc-btn[data-o="${step.answer}"]`); if(c)c.style.background='#2ecc71',c.style.boxShadow='none'; }
          if (correct) score++;
          stepIdx++;
          setTimeout(renderStep, 1100);
        });
      });
    }
    renderStep();
  }
};
