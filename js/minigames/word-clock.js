/**
 * Mini-Game: Word Clock (Wort-Uhr)
 * A clock shows a time - pick the correct written form.
 */
export const WordClock = {
  id: 'word-clock',
  name_de: 'Wort-Uhr',
  topics: ['wortschatz', 'lesen'],
  setup(container, task, onComplete) {
    const times = [
      { display: '3:00', answer: 'drei Uhr', options: ['zwei Uhr', 'drei Uhr', 'vier Uhr', 'halb vier'] },
      { display: '7:30', answer: 'halb acht', options: ['sieben Uhr', 'halb sieben', 'halb acht', 'acht Uhr'] },
      { display: '12:00', answer: 'zwölf Uhr', options: ['elf Uhr', 'Mitternacht', 'zwölf Uhr', 'Mittag'] },
      { display: '6:15', answer: 'Viertel nach sechs', options: ['Viertel vor sechs', 'halb sieben', 'Viertel nach sechs', 'sechs Uhr'] },
      { display: '9:45', answer: 'Viertel vor zehn', options: ['halb zehn', 'Viertel vor zehn', 'Viertel nach neun', 'zehn Uhr'] }
    ];
    const t = times[Math.floor(Math.random() * times.length)];
    const [h, m] = t.display.split(':').map(Number);
    const hourAngle = (h % 12) * 30 + m * 0.5;
    const minAngle = m * 6;

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <p style="color:var(--text-secondary);margin-bottom:20px;">Wie heißt diese Uhrzeit auf Deutsch?</p>
        <div style="margin:0 auto 30px; width:160px; height:160px; border-radius:50%; background:white; border:8px solid #2c3e50; position:relative; box-shadow:0 5px 15px rgba(0,0,0,.2);">
          <!-- Hour hand -->
          <div style="position:absolute;bottom:50%;left:50%;width:4px;height:45px;background:#2c3e50;border-radius:4px;transform-origin:bottom center;transform:translateX(-50%) rotate(${hourAngle}deg);"></div>
          <!-- Minute hand -->
          <div style="position:absolute;bottom:50%;left:50%;width:3px;height:65px;background:#e74c3c;border-radius:3px;transform-origin:bottom center;transform:translateX(-50%) rotate(${minAngle}deg);"></div>
          <!-- Center dot -->
          <div style="position:absolute;top:50%;left:50%;width:10px;height:10px;background:#2c3e50;border-radius:50%;transform:translate(-50%,-50%);"></div>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${t.options.map(o=>`<button class="clock-btn" data-o="${o}" style="padding:14px;font-size:1.1rem;border-radius:10px;border:none;cursor:pointer;background:#ecf0f1;color:#2c3e50;font-weight:bold;box-shadow:0 3px 0 #bdc3c7;">${o}</button>`).join('')}
        </div>
      </div>`;

    container.querySelectorAll('.clock-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.clock-btn').forEach(b => b.style.pointerEvents='none');
        const correct = btn.dataset.o === t.answer;
        btn.style.background = correct ? '#2ecc71' : '#e74c3c'; btn.style.color='white';
        if (!correct) { const c=container.querySelector(`.clock-btn[data-o="${t.answer}"]`); if(c)c.style.background='#2ecc71',c.style.color='white'; }
        setTimeout(() => onComplete({ correct, score: correct ? 100 : 0 }), 1200);
      });
    });
  }
};
