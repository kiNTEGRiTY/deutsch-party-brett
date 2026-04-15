/**
 * Mini-Game: Tense Switcher (Zeitformen-Schalter)
 * Transform a sentence from one tense to another.
 */
export const TenseSwitcher = {
  id: 'tense-switcher',
  name_de: 'Zeitformen-Schalter',
  topics: ['zeitformen', 'grammatik'],
  setup(container, task, onComplete) {
    const tasks = [
      { present: 'Ich esse einen Apfel.', past: 'Ich aß einen Apfel.', from: 'Präsens', to: 'Vergangenheit', verb: 'esse', pastVerb: 'aß', options: ['aß', 'frisst', 'gegessen', 'isst'] },
      { present: 'Er schläft tief.', past: 'Er schlief tief.', from: 'Präsens', to: 'Vergangenheit', verb: 'schläft', pastVerb: 'schlief', options: ['schlief', 'schläfert', 'schlafe', 'schläfst'] },
      { present: 'Wir laufen schnell.', past: 'Wir liefen schnell.', from: 'Präsens', to: 'Vergangenheit', verb: 'laufen', pastVerb: 'liefen', options: ['liefen', 'lauften', 'gelaufen', 'läuft'] }
    ];
    const t = tasks[Math.floor(Math.random() * tasks.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;">
          <span style="background:#3498db;color:white;padding:5px 12px;border-radius:20px;font-weight:bold;">${t.from}</span>
          <span style="font-size:1.5rem;">-></span>
          <span style="background:#e74c3c;color:white;padding:5px 12px;border-radius:20px;font-weight:bold;">${t.to}</span>
        </div>
        <div style="font-size:1.4rem;font-weight:bold;color:#2c3e50;background:rgba(255,255,255,0.8);padding:20px;border-radius:12px;margin-bottom:15px;">${t.present}</div>
        <div style="margin-bottom:25px;font-size:1.3rem;color:#7f8c8d;">
          ${t.past.replace(t.pastVerb, `<span style="border-bottom:3px dashed #e74c3c;color:#e74c3c;padding:0 5px;">_____</span>`)}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${t.options.sort(()=>Math.random()-.5).map(o=>`<button class="ts-btn" data-o="${o}" style="padding:14px;font-size:1.2rem;border-radius:10px;border:none;cursor:pointer;background:#34495e;color:white;font-weight:bold;box-shadow:0 4px 0 #2c3e50;">${o}</button>`).join('')}
        </div>
      </div>`;
    container.querySelectorAll('.ts-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.ts-btn').forEach(b => b.style.pointerEvents='none');
        const correct = btn.dataset.o === t.pastVerb;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c';
        btn.style.boxShadow='none';
        if (!correct) { const c=container.querySelector(`.ts-btn[data-o="${t.pastVerb}"]`); if(c)c.style.background='#2ecc71',c.style.boxShadow='none'; }
        setTimeout(()=>onComplete({correct,score:correct?100:0}),1200);
      });
    });
  }
};
