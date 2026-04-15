/**
 * Mini-Game: Noun Hunter
 * 
 * Find all nouns in a short text by clicking on them.
 */

export const NounHunter = {
  id: 'noun-hunter',
  name_de: 'Nomen-Jäger',
  topics: ['nomen'],

  setup(container, task, onComplete) {
    // Get noun texts from Rechtschreibung content (where they live)
    // We import them indirectly through the content system
    const content = task.content;
    
    // Use mixed sets words to create a simple noun-finding scenario
    const nounWords = content.words || [];
    if (nounWords.length === 0) {
      onComplete({ correct: false, score: 0 });
      return;
    }

    // Create a simple text with known nouns
    const allNouns = nounWords.slice(0, 5);
    const nonNouns = ['laufen', 'spielen', 'groß', 'schnell', 'gerne', 'heute', 'und', 'mit', 'einem', 'sehr', 'im', 'auf', 'dem'];
    
    // Build a word list mixing nouns and non-nouns
    const wordList = [];
    let nounIdx = 0;
    for (let i = 0; i < 12; i++) {
      if (nounIdx < allNouns.length && (i % 3 === 1 || i === 0)) {
        wordList.push({ word: allNouns[nounIdx], isNoun: true });
        nounIdx++;
      } else {
        const nonNoun = nonNouns[Math.floor(Math.random() * nonNouns.length)];
        wordList.push({ word: nonNoun, isNoun: false });
      }
    }

    const totalNouns = wordList.filter(w => w.isNoun).length;
    const selectedNouns = new Set();

    container.innerHTML = `
      <div class="minigame-body">
        <p style="text-align:center; font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-md);">
          Finde alle <strong>${totalNouns} Nomen</strong> im Text!
        </p>
        <div class="highlight-text" id="noun-text">
          ${wordList.map((w, i) => `
            <span class="highlight-word" data-index="${i}" data-noun="${w.isNoun}">${w.word}</span>
          `).join(' ')}
        </div>
        <div style="text-align:center; margin-top: var(--space-lg);">
          <span id="noun-count" style="font-weight: bold; color: var(--color-primary);">
            0 / ${totalNouns} Nomen gefunden
          </span>
        </div>
        <div style="text-align:center; margin-top: var(--space-md);">
          <button class="btn btn-primary btn-sm" id="done-btn" disabled>✓ Fertig!</button>
        </div>
      </div>
    `;

    container.querySelectorAll('.highlight-word').forEach(span => {
      span.addEventListener('click', () => {
        const idx = span.dataset.index;
        const isNoun = span.dataset.noun === 'true';
        
        if (selectedNouns.has(idx)) {
          selectedNouns.delete(idx);
          span.classList.remove('selected');
        } else {
          selectedNouns.add(idx);
          span.classList.add('selected');
        }

        // Update count
        const correctSelected = [...selectedNouns].filter(i => {
          return wordList[parseInt(i)].isNoun;
        }).length;
        
        document.getElementById('noun-count').textContent = 
          `${correctSelected} / ${totalNouns} Nomen gefunden`;
        
        document.getElementById('done-btn').disabled = selectedNouns.size === 0;
      });
    });

    document.getElementById('done-btn')?.addEventListener('click', () => {
      let correct = 0;
      let wrong = 0;
      
      container.querySelectorAll('.highlight-word').forEach(span => {
        const idx = span.dataset.index;
        const isNoun = span.dataset.noun === 'true';
        const wasSelected = selectedNouns.has(idx);
        
        if (isNoun && wasSelected) {
          span.classList.add('correct-highlight');
          correct++;
        } else if (isNoun && !wasSelected) {
          span.classList.add('wrong-highlight');
        } else if (!isNoun && wasSelected) {
          span.classList.add('wrong-highlight');
          wrong++;
        }
        span.style.pointerEvents = 'none';
      });

      const score = Math.max(0, Math.round(((correct - wrong * 0.5) / totalNouns) * 100));
      
      setTimeout(() => {
        onComplete({
          correct: score >= 80,
          partial: score >= 50,
          score,
          details: { found: correct, missed: totalNouns - correct, wrongPicks: wrong }
        });
      }, 2000);
    });
  }
};
