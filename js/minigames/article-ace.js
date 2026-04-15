/**
 * Mini-Game: Article Ace (Artikel-Ass)
 * Match the correct article to the noun under time pressure.
 */
export const ArticleAce = {
  id: 'article-ace',
  name_de: 'Artikel-Ass',
  topics: ['artikel'],
  setup(container, task, onComplete) {
    const items = [
      { w: 'Hund', a: 'der' },
      { w: 'Katze', a: 'die' },
      { w: 'Haus', a: 'das' }
    ].sort(() => Math.random() - 0.5);
    let idx = 0, score = 0;

    function render() {
      if (idx >= items.length) {
        onComplete({ correct: score >= 2, score: Math.round((score/items.length)*100) });
        return;
      }
      const item = items[idx];
      container.innerHTML = `
        <div style="padding:var(--space-md);text-align:center;max-width:500px;margin:0 auto;">
          <div style="font-size:4rem;font-weight:bold;margin-bottom:30px;">${item.w}</div>
          <div style="display:flex;gap:15px;justify-content:center;">
             <button class="ace-btn" data-a="der" style="padding:15px 30px;background:#3498db;color:white;border:none;border-radius:10px;font-size:1.5rem;font-weight:bold;cursor:pointer;">der</button>
             <button class="ace-btn" data-a="die" style="padding:15px 30px;background:#e74c3c;color:white;border:none;border-radius:10px;font-size:1.5rem;font-weight:bold;cursor:pointer;">die</button>
             <button class="ace-btn" data-a="das" style="padding:15px 30px;background:#2ecc71;color:white;border:none;border-radius:10px;font-size:1.5rem;font-weight:bold;cursor:pointer;">das</button>
          </div>
        </div>`;
      
      container.querySelectorAll('.ace-btn').forEach(btn => {
        btn.onclick = () => {
          if (btn.dataset.a === item.a) score++;
          idx++;
          render();
        };
      });
    }
    render();
  }
};
