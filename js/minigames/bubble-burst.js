/**
 * Mini-Game: Bubble Burst (Adjektiv-Blase)
 * Bubbles float up. Burst only the Adjectives!
 */
export const BubbleBurst = {
  id: 'bubble-burst',
  name_de: 'Adjektiv-Blasen',
  topics: ['adjektive', 'wortarten'],
  setup(container, task, onComplete) {
    const adjectives = ['groß', 'klein', 'schnell', 'langsam', 'heiß', 'kalt', 'schön', 'hässlich', 'laut', 'leise'];
    const nonAdj = ['laufen', 'Haus', 'schreiben', 'Baum', 'essen', 'Kind', 'fliegen', 'Tisch'];
    let score = 0, lives = 3, isPlaying = false, gameFrame;

    container.innerHTML = `
      <div style="position:relative;width:100%;height:60vh;max-height:500px;background:linear-gradient(to bottom,#87CEEB 0%,#e0f7fa 100%);border-radius:16px;overflow:hidden;touch-action:none;">
        <div style="position:absolute;top:10px;left:10px;right:10px;display:flex;justify-content:space-between;z-index:10;font-family:'Fredoka One',cursive;">
          <span style="background:rgba(255,255,255,.7);padding:4px 12px;border-radius:20px;">💥 <span id="bb-score">0</span></span>
          <span id="bb-lives" style="background:rgba(255,255,255,.7);padding:4px 12px;border-radius:20px;">❤️❤️❤️</span>
        </div>
        <div id="bb-overlay" style="position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:50;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <p style="color:white;font-size:1.4rem;font-family:'Fredoka One',cursive;text-align:center;">Zerplatze die ADJEKTIVE!<br><span style="font-size:.9rem;color:#f39c12;">Nomen und Verben stehen lassen!</span></p>
          <button id="bb-start" class="btn btn-primary btn-lg mt-3">Los!</button>
        </div>
        <div id="bb-area" style="position:absolute;inset:0;"></div>
      </div>`;

    const area = container.querySelector('#bb-area');
    const scoreEl = container.querySelector('#bb-score');
    const livesEl = container.querySelector('#bb-lives');
    let bubbles = [];
    const colors = { adj: ['#3498db','#9b59b6','#e74c3c'], other: ['#95a5a6','#7f8c8d'] };

    function spawnBubble() {
      if (!isPlaying) return;
      const isAdj = Math.random() > 0.4;
      const word = isAdj ? adjectives[Math.floor(Math.random()*adjectives.length)] : nonAdj[Math.floor(Math.random()*nonAdj.length)];
      const color = isAdj ? colors.adj[Math.floor(Math.random()*colors.adj.length)] : colors.other[Math.floor(Math.random()*colors.other.length)];
      const size = 60 + Math.random() * 30;
      const el = document.createElement('div');
      el.textContent = word;
      Object.assign(el.style, {
        position:'absolute', bottom:'-80px', left:`${5+Math.random()*80}%`,
        width:`${size}px`, height:`${size}px`, borderRadius:'50%',
        background:color + '99', border:`2px solid ${color}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'.75rem', fontWeight:'bold', color:'white', cursor:'pointer',
        userSelect:'none', transition:'opacity .2s', textAlign:'center', padding:'5px'
      });
      area.appendChild(el);
      const obj = { el, isAdj, y: -80, speed: 0.6+Math.random()*0.8 };
      bubbles.push(obj);
      el.addEventListener('pointerdown', () => {
        if (!isPlaying) return;
        if (obj.isAdj) {
          score++; scoreEl.textContent=score;
          el.style.transform='scale(1.5)'; el.style.opacity='0';
        } else {
          lives--;
          livesEl.textContent='❤️'.repeat(Math.max(0,lives));
          el.style.background='red'; el.style.opacity='0';
          if (lives <= 0) { isPlaying=false; cancelAnimationFrame(gameFrame); setTimeout(()=>onComplete({correct:score>=5,score:Math.min(100,score*10)}),500); }
        }
        bubbles=bubbles.filter(b=>b!==obj);
        setTimeout(()=>el.remove(),200);
      });
    }

    function loop() {
      if (!isPlaying) return;
      for (let i=bubbles.length-1;i>=0;i--) {
        const b=bubbles[i];
        b.y+=b.speed;
        b.el.style.bottom=`${b.y}px`;
        if (b.y > area.clientHeight+100) { b.el.remove(); bubbles.splice(i,1); }
      }
      if (Math.random()<0.015) spawnBubble();
      if (score >= 10) { isPlaying=false; cancelAnimationFrame(gameFrame); setTimeout(()=>onComplete({correct:true,score:100}),300); return; }
      gameFrame=requestAnimationFrame(loop);
    }

    container.querySelector('#bb-start').addEventListener('click',()=>{
      container.querySelector('#bb-overlay').style.display='none';
      isPlaying=true; loop();
    });
  }
};
