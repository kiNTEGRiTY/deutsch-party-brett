/**
 * Mini-Game: Cryptogram (Geheimcode-Knacker)
 * 
 * Players decode a word where letters are replaced by emojis.
 */

export const Cryptogram = {
  id: 'cryptogram',
  name_de: 'Geheimcode',
  topics: ['wortschatz', 'lesen'],

  setup(container, task, onComplete) {
    const words = ['AUTO', 'HAUS', 'BAUM', 'MAUS', 'BUCH', 'HUND', 'ZUG'];
    const emojis = ['🍎', '🍌', '🍒', '🐶', '⚽', '⏰', '🌙', '⭐', '🎈'];
    
    const targetWord = words[Math.floor(Math.random() * words.length)];
    
    // Create a cipher map for this word
    const cipher = {};
    const unqiueChars = [...new Set([...targetWord])];
    
    const availableEmojis = [...emojis].sort(() => Math.random() - 0.5);
    unqiueChars.forEach((ch, idx) => {
        cipher[ch] = availableEmojis[idx];
    });

    const encryptedArr = [...targetWord].map(ch => cipher[ch]);

    // Options for guessing the entire word
    const distractors = words.filter(w => w !== targetWord).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);

    container.innerHTML = `
      <div class="crypto-container" style="padding: var(--space-md); text-align: center; user-select:none;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🕵️‍♀️ 📝</div>
        <p style="font-size: var(--font-size-md); color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Entschlüssle das Geheimwort!
        </p>

        <!-- Cipher Legend -->
        <div style="display:flex; justify-content:center; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
            ${unqiueChars.map(ch => `
                <div style="background:#ecf0f1; padding: 5px 10px; border-radius: 8px; font-weight:bold; color:#2c3e50;">
                    ${cipher[ch]} = ${ch}
                </div>
            `).join('')}
        </div>

        <!-- Encrypted Word -->
        <div style="font-size: 3rem; margin-bottom: 40px; letter-spacing: 10px; background: rgba(0,0,0,0.05); padding: 20px; border-radius: 12px;">
            ${encryptedArr.join('')}
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
            ${options.map(opt => `
                <button class="btn cry-btn" data-word="${opt}" style="font-size:1.4rem; padding:15px 30px; border-radius:8px; background:#9b59b6; color:white; border:none; font-family:'Fredoka One', cursive;">
                    ${opt}
                </button>
            `).join('')}
        </div>
      </div>
    `;

    container.querySelectorAll('.cry-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isCorrect = btn.dataset.word === targetWord;

            if (isCorrect) {
                btn.style.background = '#2ecc71';
            } else {
                btn.style.background = '#e74c3c';
            }

            container.querySelectorAll('.cry-btn').forEach(b => b.style.pointerEvents = 'none');

            setTimeout(() => {
                onComplete({
                    correct: isCorrect,
                    score: isCorrect ? 100 : 0
                });
            }, 1500);
        });
    });
  }
};
