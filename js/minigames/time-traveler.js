/**
 * High-Fidelity: Time Traveler (Der Zeitreisende)
 * Verb conjugation with a "Time Dial". Correctness leads to visual growth.
 */
export const TimeTraveler = {
  id: 'time-traveler',
  name_de: 'Zeitreisende Pflanze',
  topics: ['zeitformen', 'verben', 'grammatik'],
  setup(container, task, onComplete) {
    const verbs = [
      { inf: 'gehen', pr: 'ich gehe', pt: 'ich ging', pf: 'ich bin gegangen' },
      { inf: 'laufen', pr: 'ich laufe', pt: 'ich lief', pf: 'ich bin gelaufen' }
    ];
    const v = verbs[Math.floor(Math.random() * verbs.length)];
    const tenses = ['Präsens', 'Präteritum', 'Perfekt'];
    const targetTense = tenses[Math.floor(Math.random() * tenses.length)];
    const answer = targetTense === 'Präsens' ? v.pr : targetTense === 'Präteritum' ? v.pt : v.pf;
    
    // Distractors
    const options = [v.pr, v.pt, v.pf, 'ich gehete', 'ich habe gegangen'].sort(() => Math.random() - 0.5);

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:500px;margin:0 auto;text-align:center;user-select:none;touch-action:none;background:linear-gradient(to bottom, #dff9fb, #ffffff);border-radius:24px;border:4px solid #7ed6df;min-height:65vh;overflow:hidden;position:relative;';

      wrapper.innerHTML = `
        <style>
          @keyframes grow { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
          .tt-leaf { animation: grow 0.5s ease-out forwards; width:50px; height:80px; background:#6ab04c; border-radius:100% 0 100% 0; position:absolute; }
          .tt-btn { padding:15px; background:white; border:2px solid #7ed6df; border-radius:12px; font-weight:bold; cursor:pointer; font-size:1.1rem; transition:all 0.2s; }
          .tt-btn:active { transform:scale(0.95); background:#7ed6df; color:white; }
        </style>
        
        <div style="font-size:1.8rem;color:#22a6b3;margin-bottom:10px;">⏳ Baum der Zeiten</div>
        <p style="color:#535c68;margin-bottom:30px;">Wähle die Form für <b>${v.inf}</b> im <span style="color:#eb4d4b;font-weight:bold;">${targetTense}</span>!</p>
        
        <!-- The Plant -->
        <div id="tt-plant" style="height:200px;display:flex;align-items:flex-end;justify-content:center;position:relative;margin-bottom:40px;">
          <div style="width:15px;height:150px;background:#95afc0;border-radius:10px;position:relative;">
             <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:3rem;">🌱</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr;gap:10px;">
          ${options.map(opt => `<button class="tt-btn" data-v="${opt}">${opt}</button>`).join('')}
        </div>
      `;

      wrapper.querySelectorAll('.tt-btn').forEach(btn => {
        btn.onclick = () => {
          const val = btn.dataset.v;
          const isCorrect = val === answer;
          if (isCorrect) {
            btn.style.background = '#6ab04c';
            btn.style.borderColor = '#6ab04c';
            btn.style.color = 'white';
            // Visual growth
            for(let i=0; i<3; i++) {
              const leaf = document.createElement('div');
              leaf.classList.add('tt-leaf');
              leaf.style.left = `${Math.random() * 80 + 10}%`;
              leaf.style.top = `${Math.random() * 50 + 10}%`;
              wrapper.querySelector('#tt-plant').appendChild(leaf);
            }
            setTimeout(() => onComplete({ correct: true, score: 100 }), 1500);
          } else {
            btn.style.background = '#eb4d4b';
            btn.style.borderColor = '#eb4d4b';
            btn.style.color = 'white';
            wrapper.style.animation = 'shake 0.5s';
            setTimeout(() => { btn.style.background = 'white'; btn.style.color = 'inherit'; }, 600);
          }
        };
      });

      container.appendChild(wrapper);
    }
    render();
  }
};
