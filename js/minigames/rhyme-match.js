/**
 * Mini-Game: Rhyme Match
 * 
 * Match pairs of rhyming words.
 */

export const RhymeMatch = {
  id: 'rhyme-match',
  name_de: 'Reimpaare finden',
  topics: ['reime'],

  setup(container, task, onComplete) {
    const content = task.content;
    
    if (!content.pairs || content.pairs.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Pick 4 rhyme pairs
    const selectedPairs = [...content.pairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
    
    // Flatten and shuffle all words
    const allWords = selectedPairs.flatMap(pair => pair).sort(() => Math.random() - 0.5);
    
    let selectedWord = null;
    let selectedElement = null;
    let matchedPairs = 0;
    const totalPairs = selectedPairs.length;
    const matchedWords = new Set();

    // Build a lookup: for each word, find its rhyme partner
    const rhymeMap = {};
    for (const [a, b] of selectedPairs) {
      rhymeMap[a] = b;
      rhymeMap[b] = a;
    }

    container.innerHTML = `
      <div class="minigame-body">
        <p style="text-align:center; font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
          Finde die Wörter, die sich reimen! Tippe zwei zusammenpassende Wörter an.
        </p>
        <div style="text-align:center; margin-bottom: var(--space-lg);">
          <span id="match-count" style="font-weight: bold; color: var(--color-primary);">
            0 / ${totalPairs} Paare gefunden
          </span>
        </div>
        <div class="answer-options" style="max-width: 600px; margin: 0 auto; grid-template-columns: repeat(4, 1fr);">
          ${allWords.map((word, i) => `
            <button class="answer-option rhyme-word" data-word="${word}" data-index="${i}" 
                    style="font-size: var(--font-size-lg);">
              ${word}
            </button>
          `).join('')}
        </div>
        <div id="feedback-area" style="text-align:center; margin-top: var(--space-lg); min-height: 40px;"></div>
      </div>
    `;

    container.querySelectorAll('.rhyme-word').forEach(btn => {
      btn.addEventListener('click', () => {
        const word = btn.dataset.word;
        
        if (matchedWords.has(word)) return;
        
        if (!selectedWord) {
          // First selection
          selectedWord = word;
          selectedElement = btn;
          btn.style.outline = '3px solid var(--color-primary)';
          btn.style.background = 'var(--color-primary-light)';
          btn.style.color = 'white';
        } else if (selectedWord === word) {
          // Clicked same word, deselect
          btn.style.outline = 'none';
          btn.style.background = '';
          btn.style.color = '';
          selectedWord = null;
          selectedElement = null;
        } else {
          // Second selection - check if rhyme
          const isMatch = rhymeMap[selectedWord] === word;
          
          if (isMatch) {
            // Match!
            matchedPairs++;
            matchedWords.add(word);
            matchedWords.add(selectedWord);
            
            btn.classList.add('correct');
            btn.style.outline = 'none';
            btn.style.pointerEvents = 'none';
            selectedElement.classList.add('correct');
            selectedElement.style.outline = 'none';
            selectedElement.style.pointerEvents = 'none';
            
            document.getElementById('match-count').textContent = 
              `${matchedPairs} / ${totalPairs} Paare gefunden`;
            
            document.getElementById('feedback-area').innerHTML = 
              `<span style="color: var(--color-success); font-weight: bold;">
                "${selectedWord}" reimt sich auf "${word}"! 🎵
              </span>`;
            
            if (matchedPairs >= totalPairs) {
              setTimeout(() => {
                onComplete({ correct: true, score: 100 });
              }, 1500);
            }
          } else {
            // No match
            btn.classList.add('wrong');
            selectedElement.classList.add('wrong');
            
            document.getElementById('feedback-area').innerHTML = 
              `<span style="color: var(--color-error); font-weight: bold;">
                Diese Wörter reimen sich nicht 🤔
              </span>`;
            
            setTimeout(() => {
              btn.classList.remove('wrong');
              btn.style.background = '';
              btn.style.color = '';
              selectedElement.classList.remove('wrong');
              selectedElement.style.outline = 'none';
              selectedElement.style.background = '';
              selectedElement.style.color = '';
            }, 800);
          }
          
          selectedWord = null;
          selectedElement = null;
        }
      });
    });
  }
};
