/**
 * Mini-Game: Comic Strip (Comic-Macher)
 * Arrange sentence fragments in narrative order.
 */
export const ComicStrip = {
  id: 'comic-strip',
  name_de: 'Comic-Macher',
  topics: ['lesen', 'satzbau'],
  setup(container, task, onComplete) {
    const stories = [
      {
        panels: [
          { id: 'a', emoji: '🐕😴', text: 'Der Hund schläft tief.' },
          { id: 'b', emoji: '🔔📣', text: 'Die Türklingel läutet laut.' },
          { id: 'c', emoji: '🐕🏃', text: 'Der Hund springt auf und läuft zur Tür.' },
          { id: 'd', emoji: '🚪👋', text: 'Es ist der Briefträger mit einem Paket!' }
        ],
        order: ['a', 'b', 'c', 'd']
      },
      {
        panels: [
          { id: 'a', emoji: '🌱💧', text: 'Anna pflanzt einen Samen.' },
          { id: 'b', emoji: '☀️🌧️', text: 'Sie gießt ihn jeden Tag.' },
          { id: 'c', emoji: '🌿', text: 'Nach einer Woche wächst ein Blatt.' },
          { id: 'd', emoji: '🌸🎉', text: 'Im Sommer blüht eine wunderschöne Blume!' }
        ],
        order: ['a', 'b', 'c', 'd']
      }
    ];
    const story = stories[Math.floor(Math.random() * stories.length)];
    const shuffled = [...story.panels].sort(() => Math.random() - 0.5);
    let placed = [];
    let selected = null;

    function render() {
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
          <div style="font-size:1rem;color:var(--text-secondary);margin-bottom:10px;">Bringe die Comic-Panels in die richtige Reihenfolge!</div>
          
          <!-- Drop zone -->
          <div id="cs-slots" style="display:flex;gap:8px;margin-bottom:15px;min-height:100px;justify-content:center;flex-wrap:wrap;">
            ${[0,1,2,3].map(i=>`
              <div class="cs-slot" data-slot="${i}" style="width:100px;min-height:90px;border-radius:10px;border:2px dashed ${placed[i]?'transparent':'#bdc3c7'};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:5px;background:${placed[i]?'rgba(52,152,219,.15)':'rgba(255,255,255,.3)'};cursor:pointer;">
                ${placed[i] ? `<div style="font-size:2rem;">${placed[i].emoji}</div><div style="font-size:.7rem;color:#2c3e50;font-weight:bold;">${placed[i].text}</div>` : `<div style="color:#bdc3c7;font-size:1.4rem;">${i+1}</div>`}
              </div>
            `).join('')}
          </div>

          <!-- Source panels -->
          <div id="cs-source" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:15px;">
            ${shuffled.filter(p=>!placed.includes(p)).map(p=>`
              <div class="cs-panel" data-id="${p.id}" style="width:100px;min-height:90px;border-radius:10px;background:${selected?.id===p.id?'#3498db':'white'};padding:8px;cursor:pointer;border:2px solid ${selected?.id===p.id?'#2980b9':'#bdc3c7'};display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 2px 5px rgba(0,0,0,.1);">
                <div style="font-size:2rem;">${p.emoji}</div>
                <div style="font-size:.65rem;color:#2c3e50;font-weight:bold;text-align:center;margin-top:4px;">${p.text}</div>
              </div>
            `).join('')}
          </div>

          <button id="cs-check" class="btn btn-primary" ${placed.filter(Boolean).length<4?'disabled':''} style="width:100%;max-width:250px;opacity:${placed.filter(Boolean).length<4?'.5':'1'};">Überprüfen ✓</button>
        </div>`;

      container.querySelectorAll('.cs-panel').forEach(el => {
        el.addEventListener('click', () => {
          selected = shuffled.find(p=>p.id===el.dataset.id);
          render();
        });
      });

      container.querySelectorAll('.cs-slot').forEach(el => {
        el.addEventListener('click', () => {
          if (!selected) return;
          const slot = parseInt(el.dataset.slot);
          // If slot occupied, swap back to source
          if (placed[slot]) { shuffled.push(placed[slot]); }
          placed[slot] = selected;
          shuffled.splice(shuffled.indexOf(selected), 1);
          selected = null;
          render();
        });
      });

      container.querySelector('#cs-check')?.addEventListener('click', () => {
        container.querySelectorAll('.cs-check, .cs-panel, .cs-slot').forEach(el=>el.style.pointerEvents='none');
        const isCorrect = placed.every((p, i) => p?.id === story.order[i]);
        placed.forEach((p, i) => {
          const slot = container.querySelectorAll('.cs-slot')[i];
          if (slot) slot.style.background = p?.id===story.order[i]?'#2ecc7133':'#e74c3c33';
        });
        setTimeout(()=>onComplete({correct:isCorrect,score:isCorrect?100:Math.round((placed.filter((p,i)=>p?.id===story.order[i]).length/4)*100)}),1500);
      });
    }
    render();
  }
};
