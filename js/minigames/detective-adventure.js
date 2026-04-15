/**
 * Masterpiece: Detective Adventure (Der Fall des verschwundenen Nomens)
 * A multi-screen point-and-click mystery with reading comprehension and logic clues.
 */
export const DetectiveAdventure = {
  id: 'detective-adventure',
  name_de: 'Detektiv-Abenteuer',
  topics: ['lesen', 'grammatik', 'wortschatz'],
  setup(container, task, onComplete) {
    let state = 'intro'; // intro, map, location_park, location_shop, location_house, accusation
    let cluesFound = [];
    const suspects = [
      { id: 'fox', name: 'Fuchs', clue: 'Der Täter trägt einen <b style="color:#e74c3c;">roten</b> Schal.' },
      { id: 'bear', name: 'Bär', clue: 'Der Täter hat <b style="color:#e74c3c;">große</b> Pfoten.' },
      { id: 'rabbit', name: 'Hase', clue: 'Der Täter liebt <b style="color:#e74c3c;">Karotten</b>.' }
    ];
    const culprit = suspects[Math.floor(Math.random() * suspects.length)];

    function render() {
      container.innerHTML = '';
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'padding:var(--space-md);max-width:600px;margin:0 auto;text-align:center;font-family:inherit;';

      if (state === 'intro') {
        wrapper.innerHTML = `
          <div style="font-size:4rem;margin-bottom:20px;">🕵️‍♂️🔎</div>
          <h2 style="color:var(--text-primary);margin-bottom:15px;">Der Fall: Das verschwundene Wort</h2>
          <p style="color:var(--text-secondary);font-size:1.1rem;line-height:1.6;margin-bottom:30px;">
            Ein wertvolles Nomen wurde gestohlen! Ein Zeuge sagt: <i>"Ich habe jemanden weglaufen sehen, aber mein Gedächtnis ist lückenhaft."</i>
            Sammle 3 Hinweise in der Stadt, um den Dieb zu entlarven!
          </p>
          <button id="start-da" class="btn btn-primary" style="width:100%;padding:18px;font-size:1.2rem;">Ermittlung starten -></button>
        `;
        wrapper.querySelector('#start-da').onclick = () => { state = 'map'; render(); };
      } 
      else if (state === 'map') {
        const locations = [
          { id: 'park', name: 'Stadtpark', icon: '🌳', found: cluesFound.includes('park') },
          { id: 'shop', name: 'Supermarkt', icon: '🛒', found: cluesFound.includes('shop') },
          { id: 'house', name: 'Altes Haus', icon: '🏚️', found: cluesFound.includes('house') }
        ];
        wrapper.innerHTML = `
          <div style="font-size:2rem;margin-bottom:15px;">📍 Die Stadt-Karte</div>
          <p style="color:var(--text-secondary);margin-bottom:20px;">Wo willst du suchen? (${cluesFound.length}/3 Hinweise)</p>
          <div style="display:grid;grid-template-columns:1fr;gap:15px;">
            ${locations.map(loc => `
              <button class="loc-btn" data-id="${loc.id}" style="padding:20px;background:${loc.found ? '#ecf0f1' : 'white'};border:2px solid #34495e;border-radius:12px;display:flex;align-items:center;gap:20px;cursor:${loc.found ? 'default' : 'pointer'};opacity:${loc.found ? 0.6 : 1};" ${loc.found ? 'disabled' : ''}>
                <span style="font-size:2.5rem;">${loc.icon}</span>
                <span style="font-size:1.3rem;font-weight:bold;color:#2c3e50;">${loc.name} ${loc.found ? '✅' : ''}</span>
              </button>
            `).join('')}
          </div>
          ${cluesFound.length === 3 ? `
            <button id="accuse-btn" class="btn btn-primary" style="margin-top:25px;width:100%;background:#e74c3c;">Anklage erheben! ⚖️</button>
          ` : ''}
        `;
        wrapper.querySelectorAll('.loc-btn').forEach(btn => {
          btn.onclick = () => { state = 'location_' + btn.dataset.id; render(); };
        });
        wrapper.querySelector('#accuse-btn')?.addEventListener('click', () => { state = 'accusation'; render(); });
      }
      else if (state.startsWith('location_')) {
        const locId = state.split('_')[1];
        const config = {
          park: { title: 'Im Stadtpark', text: 'Auf einer Parkbank liegt eine Nachricht: "Das Adjektiv für die Schalfarbe ist kleingeschrieben."', question: 'Welches Wort ist ein Farbadjektiv?', options: ['Rot', 'blau', 'Groß'], answer: 'blau' },
          shop: { title: 'Im Supermarkt', text: 'Der Verkäufer sagt: "Der Dieb hat viele Karotten gekauft."', question: 'Was liebt der Täter?', options: ['Schokolade', 'Karotten', 'Äpfel'], answer: 'Karotten' },
          house: { title: 'Im Alten Haus', text: 'An der Wand klebt ein Pfotenabdruck: Er ist riesig!', question: 'Was ist das Gegenteil von klein?', options: ['groß', 'schön', 'schnell'], answer: 'groß' }
        }[locId];

        wrapper.innerHTML = `
          <div style="font-size:3rem;margin-bottom:10px;">🔍</div>
          <h3 style="margin-bottom:10px;">${config.title}</h3>
          <div style="background:#fdfcf0;padding:20px;border-radius:12px;border:1px solid #dcdde1;font-style:italic;margin-bottom:20px;line-height:1.6;">
            "${config.text}"
          </div>
          <p style="font-weight:bold;margin-bottom:20px;">${config.question}</p>
          <div style="display:grid;grid-template-columns:1fr;gap:10px;">
            ${config.options.map(o => `<button class="opt-btn" style="padding:15px;background:white;border:2px solid #3498db;border-radius:10px;font-weight:bold;cursor:pointer;">${o}</button>`).join('')}
          </div>
        `;
        wrapper.querySelectorAll('.opt-btn').forEach(btn => {
          btn.onclick = () => {
            const correct = btn.textContent === config.answer;
            if (correct) {
              cluesFound.push(locId);
              state = 'map';
              render();
            } else {
              btn.style.background = '#e74c3c';
              btn.style.color = 'white';
              setTimeout(() => { btn.style.background = 'white'; btn.style.color = 'inherit'; }, 600);
            }
          };
        });
      }
      else if (state === 'accusation') {
        wrapper.innerHTML = `
          <div style="font-size:3rem;margin-bottom:15px;">⚖️ Wer ist der Dieb?</div>
          <p style="color:var(--text-secondary);margin-bottom:30px;">Wähle den Verdächtigen aus, auf den alle Hinweise passen:</p>
          <div style="display:grid;grid-template-cols:1fr 1fr;gap:15px;">
            ${suspects.map(s => `
              <button class="suspect-btn" data-id="${s.id}" style="padding:15px;background:white;border:2px solid #2c3e50;border-radius:12px;cursor:pointer;transition:transform 0.2s;">
                <div style="font-size:2.5rem;margin-bottom:10px;">${s.id === 'fox' ? '🦊' : s.id === 'bear' ? '🐻' : '🐰'}</div>
                <div style="font-weight:bold;font-size:1.2rem;">${s.name}</div>
              </button>
            `).join('')}
          </div>
          <div id="da-feedback" style="margin-top:25px;font-size:1.3rem;font-weight:bold;min-height:30px;"></div>
        `;
        wrapper.querySelectorAll('.suspect-btn').forEach(btn => {
          btn.onclick = () => {
            const isCorrect = btn.dataset.id === culprit.id;
            const fb = wrapper.querySelector('#da-feedback');
            fb.textContent = isCorrect ? 'FALL GELÖST! Du bist ein Meisterdetektiv! 🏆' : 'Falscher Verdächtiger! Die Beweise passen nicht...';
            fb.style.color = isCorrect ? '#2ecc71' : '#e74c3c';
            btn.style.borderColor = isCorrect ? '#2ecc71' : '#e74c3c';
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => onComplete({ correct: isCorrect, score: isCorrect ? 100 : 0 }), 1500);
          };
        });
      }

      container.appendChild(wrapper);
    }
    render();
  }
};
