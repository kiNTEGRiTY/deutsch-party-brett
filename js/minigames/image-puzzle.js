/**
 * Bilder-Puzzle Minigame
 * 
 * Slices a custom image into tiles and lets players swap them to form the full picture.
 */

export const ImagePuzzle = {
  id: 'image-puzzle',
  name_de: 'Bilder-Puzzle',
  topics: ['allgemein', 'puzzle'], // A general fun/teamwork task
  
  setup(container, task, onComplete) {
    const containerDiv = document.createElement('div');
    containerDiv.className = 'puzzle-minigame';
    
    // Determine difficulty
    const diffNode = window.app?.game?.difficulty;
    let gridSize = 3; // Default 3x3
    if (diffNode?.id === 'leicht') gridSize = 2; // 2x2
    if (diffNode?.id === 'schwer') gridSize = 4; // 4x4

    const totalTiles = gridSize * gridSize;
    
    // Select one of the wife's pictures randomly
    const images = ['steph_bild_1.jpg', 'steph_bild_2.jpg', 'steph_bild_3.jpg'];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    const bgUrl = `assets/img/${randomImage}`; // Path relative to index.html
    
    // Render Header
    containerDiv.innerHTML = `
      <div class="minigame-header">
        <h3 class="minigame-title">🧩 Das große Bilder-Puzzle</h3>
        <p class="minigame-instruction">Klicke auf zwei Kacheln, um ihre Plätze zu tauschen! Setze das Bild richtig zusammen.</p>
      </div>
      <div class="puzzle-grid-wrapper">
        <div class="puzzle-grid" style="grid-template-columns: repeat(${gridSize}, 1fr); grid-template-rows: repeat(${gridSize}, 1fr);">
        </div>
      </div>
    `;

    const gridDiv = containerDiv.querySelector('.puzzle-grid');
    
    // Create tiles logic
    // Generate an array of positions 0 to totalTiles-1
    let positions = Array.from({length: totalTiles}, (_, i) => i);
    
    // Shuffle positions (Fisher-Yates) until it's actually shuffled
    let shuffled = [...positions];
    do {
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
    } while(JSON.stringify(shuffled) === JSON.stringify(positions) && totalTiles > 1);

    let selectedTileIndex = null;
    let tiles = [];

    // Helper to check win condition
    const checkWin = () => {
      for (let i = 0; i < totalTiles; i++) {
        if (tiles[i].dataset.correctPos != i) return false;
      }
      return true;
    };

    // Render tiles based on current state array
    const renderTiles = () => {
      gridDiv.innerHTML = '';
      tiles = [];
      shuffled.forEach((originalPos, currentIndex) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        if (selectedTileIndex === currentIndex) {
          tile.classList.add('selected');
        }
        
        // Calculate background position based on the original unshuffled position
        const row = Math.floor(originalPos / gridSize);
        const col = originalPos % gridSize;
        const xPos = (col / (gridSize - 1)) * 100;
        const yPos = (row / (gridSize - 1)) * 100;

        tile.style.backgroundImage = `url('${bgUrl}')`;
        tile.style.backgroundSize = `${gridSize * 100}% ${gridSize * 100}%`;
        tile.style.backgroundPosition = `${xPos}% ${yPos}%`;
        tile.dataset.correctPos = originalPos;
        tile.dataset.currentIndex = currentIndex;

        tile.addEventListener('click', () => {
          if (selectedTileIndex === null) {
            // Select first tile
            selectedTileIndex = currentIndex;
            renderTiles();
          } else if (selectedTileIndex === currentIndex) {
            // Deselect if same tile clicked
            selectedTileIndex = null;
            renderTiles();
          } else {
            // Swap tiles!
            const temp = shuffled[selectedTileIndex];
            shuffled[selectedTileIndex] = shuffled[currentIndex];
            shuffled[currentIndex] = temp;
            selectedTileIndex = null;
            
            // Re-render and check win
            renderTiles();
            
            if(checkWin()) {
                gridDiv.classList.add('puzzle-won');
                setTimeout(() => {
                    onComplete({ success: true, reward: 3, message: 'Wunderschön! Das Bild ist wieder komplett!' });
                }, 1500);
            }
          }
        });

        tiles.push(tile);
        gridDiv.appendChild(tile);
      });
    };

    // Add required CSS dynamically for the puzzle
    if (!document.getElementById('image-puzzle-css')) {
        const style = document.createElement('style');
        style.id = 'image-puzzle-css';
        style.innerHTML = `
          .puzzle-grid-wrapper {
            display: flex;
            justify-content: center;
            margin-top: 1rem;
            width: 100%;
          }
          .puzzle-grid {
            display: grid;
            width: 100%;
            max-width: 500px;
            aspect-ratio: 1;
            gap: 4px;
            background: var(--bg-warm);
            padding: 8px;
            border-radius: 12px;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
          }
          .puzzle-tile {
            border-radius: 6px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s, border 0.1s;
            border: 2px solid transparent;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            min-height: 50px;
          }
          .puzzle-tile:hover {
            transform: scale(0.98);
          }
          .puzzle-tile.selected {
            transform: scale(0.95);
            border: 4px dashed var(--color-primary);
            box-shadow: 0 0 15px rgba(74, 108, 247, 0.5);
            opacity: 0.8;
          }
          .puzzle-grid.puzzle-won .puzzle-tile {
            gap: 0;
            border-radius: 0;
            border: none;
            box-shadow: none;
            cursor: default;
          }
          .puzzle-grid.puzzle-won {
            gap: 0;
            padding: 0;
            background: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            animation: win-pulse 1s ease;
          }
          @keyframes win-pulse {
             0% { transform: scale(1); }
             50% { transform: scale(1.05); box-shadow: 0 0 40px rgba(255,215,0,0.8); }
             100% { transform: scale(1); }
          }
        `;
        document.head.appendChild(style);
    }

    renderTiles();
    container.innerHTML = '';
    container.appendChild(containerDiv);
  }
};
