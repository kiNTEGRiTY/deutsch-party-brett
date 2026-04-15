/**
 * Mini-Game: Silben-Angeln (Syllable Fishing)
 * 
 * Players help a cardboard penguin catch the correct syllable boats in order.
 */

import { CardboardUtils } from '../ui/cardboard-utils.js';

export const SyllableFishing = {
  id: 'syllable-fishing',
  name_de: 'Silben-Angeln',
  topics: ['silben'],

  setup(container, task, onComplete) {
    const { word, syllables } = task.content;
    const targetSyllables = syllables || [];
    
    if (targetSyllables.length === 0) {
        onComplete({ correct: false, score: 0 });
        return;
    }

    let currentStep = 0;
    const boatsRects = [];

    // Create Game Area
    container.innerHTML = `
      <div class="fishing-container" style="position:relative; width:100%; height:420px; background: #e0f4ff; overflow:hidden; border-radius:12px; border: 4px solid var(--color-cardboard);">
        <!-- Sun (Paper circle) -->
        <div style="position:absolute; top:30px; right:40px; width:60px; height:60px; background:#ffd700; border-radius:50%; box-shadow: 0 0 20px rgba(255,215,0,0.4);"></div>

        <div class="water-layers" style="position:absolute; bottom:0; width:100%; height:140px; background:#4fc3f7; opacity:0.6; z-index:2; border-top: 2px dashed rgba(255,255,255,0.5);"></div>
        <div class="water-back" style="position:absolute; bottom:20px; width:100%; height:140px; background:#29b6f6; opacity:0.4; z-index:1;"></div>
        
        <!-- The Fisherman (Cardboard Penguin) -->
        <div class="fisherman" style="position:absolute; left:30px; bottom:120px; width:100px; height:100px; z-index:5;">
            <div class="char-sprite" style="background-image: url('assets/img/player-avatars.png'); background-size: 200% 200%; background-position: 100% 100%; width:100%; height:100%; filter: drop-shadow(2px 4px 0 rgba(0,0,0,0.1));"></div>
            <div class="fishing-rod" style="position:absolute; right:-20px; top:20px; width:120px; height:6px; background:#8b6b4a; transform:rotate(-35deg); transform-origin:left; border-radius:3px;"></div>
        </div>

        <div class="boats-area" style="position:absolute; inset:0; z-index:3;"></div>
        
        <div class="cardboard-item" style="position:absolute; top:20px; left:50%; transform:translateX(-50%); cursor:default; background-color: #fdf5e6; z-index:10; padding: 10px 25px;">
            <div style="font-size: 0.8rem; font-family: var(--font-handwritten); opacity: 0.6;">Suche Silbe:</div>
            <span id="current-target" style="color:#e91e63; font-weight:bold; font-size: 1.5rem;">${targetSyllables[0]}</span>
        </div>
      </div>
    `;

    const boatsArea = container.querySelector('.boats-area');
    const targetDisplay = container.querySelector('#current-target');
    
    // Create random boats
    const createBoat = (syl, isCorrect) => {
        const boat = CardboardUtils.createCardboardElement('div', 'paper-boat', syl);
        boat.style.position = 'absolute';
        
        // Random start position on the right
        const startX = 850 + Math.random() * 300;
        const startY = 220 + Math.random() * 100;
        
        boat.style.left = `${startX}px`;
        boat.style.top = `${startY}px`;
        boat.dataset.syllable = syl;
        
        boatsArea.appendChild(boat);

        // Movement logic
        let posX = startX;
        const speed = 1.5 + Math.random() * 1.5;
        const waveFreq = 0.02 + Math.random() * 0.02;
        const waveAmp = 5 + Math.random() * 5;
        const initialTop = startY;

        const animate = () => {
            if (!boat.parentNode) return;
            
            posX -= speed;
            if (posX < -150) posX = 850;
            
            boat.style.left = `${posX}px`;
            boat.style.top = `${initialTop + Math.sin(posX * waveFreq) * waveAmp}px`;
            boat.style.transform = `rotate(${Math.cos(posX * waveFreq) * 5}deg)`;
            
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);

        boat.addEventListener('click', () => {
            if (syl === targetSyllables[currentStep]) {
                // Correct!
                boat.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                boat.style.top = '120px';
                boat.style.left = '60px';
                boat.style.transform = 'scale(0.4) rotate(0deg)';
                boat.style.opacity = '0';
                
                currentStep++;
                if (currentStep < targetSyllables.length) {
                    targetDisplay.textContent = targetSyllables[currentStep];
                    CardboardUtils.wobble(targetDisplay.parentElement);
                } else {
                    targetDisplay.textContent = 'GESCHAFFT!';
                    setTimeout(() => onComplete({ correct: true, score: 100 }), 1000);
                }
                
                setTimeout(() => boat.remove(), 600);
            } else {
                // Wrong
                CardboardUtils.wobble(boat);
            }
        });
    };

    // Spawn target syllables + distractors
    targetSyllables.forEach(s => createBoat(s, true));
    const distractors = ['la', 'mu', 'ti', 'po', 'ne', 'ka', 'ri'];
    distractors.sort(() => Math.random() - 0.5).slice(0, 4).forEach(s => createBoat(s, false));

    // Ensure CSS
    if (!document.getElementById('cardboard-games-css')) {
      const link = document.createElement('link');
      link.id = 'cardboard-games-css';
      link.rel = 'stylesheet';
      link.href = 'css/cardboard-games.css';
      document.head.appendChild(link);
    }
  }
};
