/**
 * Mini-Game: Secret Agent Code (Geheimagenten-Code)
 * Decode words using a simple substitution cipher.
 */
export const SecretAgentCode = {
  id: 'secret-agent-code',
  name_de: 'Geheimagenten-Code',
  topics: ['rechtschreibung', 'lesen'],
  setup(container, task, onComplete) {
    const cipher = { 'A': '1', 'B': '2', 'C': '3', 'D': '4', 'E': '5', 'F': '6', 'G': '7', 'H': '8', 'I': '9', 'J': '0' };
    const words = [
      { normal: 'BAD', encoded: '214' },
      { normal: 'EICH', encoded: '5938' },
      { normal: 'CAFÉ', encoded: '3165' }
    ];
    const w = words[Math.floor(Math.random() * words.length)];

    container.innerHTML = `
      <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;user-select:none;">
        <div style="font-size:3rem;margin-bottom:10px;">🕵️‍♀️🕶️</div>
        <p style="color:var(--text-secondary);margin-bottom:20px;">Entziffere den Code!</p>
        <div style="background:#2c3e50;color:#2ecc71;font-family:monospace;padding:20px;border-radius:8px;font-size:2.5rem;letter-spacing:10px;margin-bottom:30px;box-shadow:inset 0 0 10px rgba(0,0,0,0.5);">
          ${w.encoded}
        </div>
        <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:5px;margin-bottom:25px;font-family:monospace;font-size:0.8rem;background:#f8f9fa;padding:10px;border-radius:8px;">
          ${Object.entries(cipher).map(([k,v]) => `<div>${k}=${v}</div>`).join('')}
        </div>
        <input id="sa-input" type="text" placeholder="Lösung..." style="width:100%;padding:15px;font-size:1.5rem;text-align:center;border-radius:10px;border:2px solid #34495e;text-transform:uppercase;outline:none;">
        <button id="sa-submit" class="btn btn-primary" style="margin-top:15px;width:100%;">Absenden</button>
      </div>`;

    const input = container.querySelector('#sa-input');
    container.querySelector('#sa-submit').onclick = () => {
      const val = input.value.trim().toUpperCase();
      const correct = val === w.normal;
      onComplete({ correct, score: correct ? 100 : 0 });
    };
  }
};
