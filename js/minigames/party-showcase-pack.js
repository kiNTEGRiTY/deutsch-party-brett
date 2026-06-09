import { SoundManager } from '../ui/sound-manager.js?v=content-card-material-50';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

function pickRounds(items, count = 3) {
  return shuffle(items).slice(0, Math.min(count, items.length));
}

function normalizeInput(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9aeiouaouss]+/g, '');
}

function renderRoundChips(chips = []) {
  return chips.map((chip) => `<span class="showcase-chip">${chip}</span>`).join('');
}

function computeResult(score, maxScore) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return {
    correct: percentage >= 75,
    partial: percentage >= 45 && percentage < 75,
    score: clamp(percentage, 0, 100)
  };
}

function createPromptShowgame(config) {
  const ratings = config.ratings || [
    { label: 'Chaos', points: 1, tone: 'fail' },
    { label: 'Stark', points: 2, tone: 'mid' },
    { label: 'Legendär', points: 3, tone: 'success' }
  ];
  const maxPerRound = Math.max(...ratings.map((rating) => rating.points));

  return {
    id: config.id,
    name_de: config.name_de,
    description: config.description,
    topics: config.topics,
    supportsDirectPlay: true,
    usesInternalTimer: true,

    setup(container, task, onComplete) {
      const rounds = pickRounds(config.rounds, config.roundCount || 3);
      let roundIndex = -1;
      let totalScore = 0;
      let countdownId = null;

      function clearCountdown() {
        if (countdownId) {
          clearInterval(countdownId);
          countdownId = null;
        }
      }

      function finishGame() {
        clearCountdown();
        const result = computeResult(totalScore, rounds.length * maxPerRound);
        onComplete({
          ...result,
          details: {
            rounds: rounds.length,
            totalScore
          }
        });
      }

      function showRating(round) {
        const timerEl = container.querySelector('#showcase-round-timer');
        if (timerEl) {
          timerEl.textContent = 'Bewerten';
          timerEl.classList.add('is-ready');
        }

        const controls = container.querySelector('#showcase-round-controls');
        controls.innerHTML = `
          <div class="showcase-score-grid">
            ${ratings.map((rating) => `
              <button class="showcase-score-button tone-${rating.tone}" data-points="${rating.points}" type="button">
                <strong>${rating.label}</strong>
                <span>+${rating.points} Punkte</span>
              </button>
            `).join('')}
          </div>
        `;

        controls.querySelectorAll('.showcase-score-button').forEach((button) => {
          button.addEventListener('click', () => {
            totalScore += Number(button.dataset.points || 0);
            SoundManager.play('success');
            renderRound();
          });
        });
      }

      function startRound(round) {
        const timerEl = container.querySelector('#showcase-round-timer');
        const twistEl = container.querySelector('#showcase-round-twist');
        const roundSeconds = round.seconds || config.seconds || 12;
        let remaining = roundSeconds;
        let twistShown = false;

        timerEl.textContent = `${remaining}s`;
        SoundManager.play('launch');
        clearCountdown();
        countdownId = setInterval(() => {
          remaining -= 1;
          if (timerEl) {
            timerEl.textContent = `${Math.max(remaining, 0)}s`;
          }

          if (!twistShown && round.twist && remaining === Math.floor(roundSeconds / 2)) {
            twistShown = true;
            twistEl.innerHTML = `
              <div class="showcase-twist-card">
                <span>Regel-Flip</span>
                <strong>${round.twist}</strong>
              </div>
            `;
            SoundManager.play('tick');
          }

          if (remaining <= 0) {
            clearCountdown();
            showRating(round);
          }
        }, 1000);
      }

      function renderRound() {
        roundIndex += 1;
        clearCountdown();

        if (roundIndex >= rounds.length) {
          finishGame();
          return;
        }

        const round = rounds[roundIndex];
        container.innerHTML = `
          <div class="showcase-shell">
            <div class="showcase-stage">
              <div class="showcase-progress">Runde ${roundIndex + 1} / ${rounds.length}</div>
              <div class="showcase-badge-row">
                ${renderRoundChips(round.chips)}
              </div>
              <div class="showcase-round-card">
                <div class="premium-kicker">${config.kicker || 'Party-Show'}</div>
                <h3 class="glow-title showcase-title">${round.title || config.name_de}</h3>
                <p class="showcase-prompt">${round.prompt}</p>
                ${round.secondary ? `<p class="showcase-secondary">${round.secondary}</p>` : ''}
                <div id="showcase-round-twist"></div>
              </div>
              <div class="showcase-status-row">
                <div class="showcase-status-pill">Score ${totalScore}</div>
                <div class="showcase-status-pill" id="showcase-round-timer">Bereit</div>
              </div>
              <div id="showcase-round-controls" class="showcase-controls">
                <button class="btn btn-primary btn-lg" id="showcase-start-round" type="button">Runde starten</button>
                <button class="btn btn-secondary" id="showcase-score-round" type="button">Direkt werten</button>
              </div>
            </div>
          </div>
        `;

        container.querySelector('#showcase-start-round').addEventListener('click', () => {
          startRound(round);
        });

        container.querySelector('#showcase-score-round').addEventListener('click', () => {
          showRating(round);
        });
      }

      container.innerHTML = `
        <div class="showcase-shell">
          <div class="showcase-stage">
            <div class="premium-kicker">${config.kicker || 'Party-Show'}</div>
            <h3 class="glow-title showcase-title">${config.name_de}</h3>
            <p class="showcase-prompt">${config.description}</p>
            <div class="showcase-badge-row">
              ${renderRoundChips(config.introChips || [])}
            </div>
            <div class="showcase-controls">
              <button class="btn btn-primary btn-lg" id="showcase-begin" type="button">Auf die Bühne</button>
            </div>
          </div>
        </div>
      `;

      container.querySelector('#showcase-begin').addEventListener('click', renderRound);
    }
  };
}

function createSolveGame(config) {
  const perRoundScore = config.perRoundScore || 1;

  return {
    id: config.id,
    name_de: config.name_de,
    description: config.description,
    topics: config.topics,
    supportsDirectPlay: true,

    setup(container, task, onComplete) {
      const rounds = pickRounds(config.rounds, config.roundCount || 3);
      let roundIndex = 0;
      let score = 0;

      function finishGame() {
        const result = computeResult(score, rounds.length * perRoundScore);
        onComplete({
          ...result,
          details: {
            hits: score,
            rounds: rounds.length
          }
        });
      }

      function renderRound() {
        if (roundIndex >= rounds.length) {
          finishGame();
          return;
        }

        const round = rounds[roundIndex];
        const chips = [...(round.chips || []), `Runde ${roundIndex + 1} / ${rounds.length}`];
        const isChoice = Array.isArray(round.options) && round.options.length > 0;

        container.innerHTML = `
          <div class="showcase-shell">
            <div class="showcase-stage solve-stage">
              <div class="premium-kicker">${config.kicker || 'Duell'}</div>
              <h3 class="glow-title showcase-title">${config.name_de}</h3>
              <div class="showcase-badge-row">
                ${renderRoundChips(chips)}
              </div>
              <div class="showcase-round-card">
                <p class="showcase-prompt">${round.prompt}</p>
                ${round.secondary ? `<p class="showcase-secondary">${round.secondary}</p>` : ''}
              </div>
              <div id="solve-feedback" class="solve-feedback"></div>
              <div id="solve-area" class="solve-area">
                ${isChoice ? `
                  <div class="showcase-score-grid">
                    ${shuffle(round.options).map((option) => `
                      <button class="showcase-score-button tone-mid solve-choice" data-answer="${option}" type="button">
                        <strong>${option}</strong>
                      </button>
                    `).join('')}
                  </div>
                ` : `
                  <div class="solve-form">
                    <input class="solve-input" id="solve-input" type="text" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="${round.placeholder || 'Antwort eingeben'}">
                    <button class="btn btn-primary" id="solve-submit" type="button">Check</button>
                  </div>
                `}
              </div>
            </div>
          </div>
        `;

        const feedbackEl = container.querySelector('#solve-feedback');
        const areaEl = container.querySelector('#solve-area');

        const checkAnswer = (value) => {
          const candidate = normalizeInput(value);
          const accepted = round.accepted || (round.answer ? [round.answer] : []);
          return accepted.some((answer) => normalizeInput(answer) === candidate);
        };

        const resolveRound = (isCorrect) => {
          if (isCorrect) {
            score += perRoundScore;
            feedbackEl.innerHTML = '<div class="solve-feedback-card success">Treffer. Das sitzt.</div>';
            SoundManager.play('success');
          } else {
            feedbackEl.innerHTML = `
              <div class="solve-feedback-card fail">
                Noch nicht. Richtig waere: <strong>${round.answer}</strong>
              </div>
            `;
            SoundManager.play('error');
          }

          areaEl.querySelectorAll('button, input').forEach((element) => {
            element.disabled = true;
          });

          setTimeout(() => {
            roundIndex += 1;
            renderRound();
          }, 1100);
        };

        if (isChoice) {
          areaEl.querySelectorAll('.solve-choice').forEach((button) => {
            button.addEventListener('click', () => {
              resolveRound(checkAnswer(button.dataset.answer));
            });
          });
          return;
        }

        const input = container.querySelector('#solve-input');
        const submit = container.querySelector('#solve-submit');
        const handleSubmit = () => {
          const value = input.value.trim();
          if (!value) {
            feedbackEl.innerHTML = '<div class="solve-feedback-card fail">Da fehlt noch eine Antwort.</div>';
            SoundManager.play('tick');
            return;
          }
          resolveRound(checkAnswer(value));
        };

        submit.addEventListener('click', handleSubmit);
        input.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            handleSubmit();
          }
        });
        input.focus();
      }

      container.innerHTML = `
        <div class="showcase-shell">
          <div class="showcase-stage">
            <div class="premium-kicker">${config.kicker || 'Duell'}</div>
            <h3 class="glow-title showcase-title">${config.name_de}</h3>
            <p class="showcase-prompt">${config.description}</p>
            <div class="showcase-badge-row">
              ${renderRoundChips(config.introChips || [])}
            </div>
            <div class="showcase-controls">
              <button class="btn btn-primary btn-lg" id="solve-begin" type="button">Starten</button>
            </div>
          </div>
        </div>
      `;

      container.querySelector('#solve-begin').addEventListener('click', renderRound);
    }
  };
}

export const BuchstabenDuell = createSolveGame({
  id: 'buchstaben-duell',
  name_de: 'Buchstaben-Duell',
  topics: ['wortschatz', 'alphabet', 'lesen'],
  kicker: 'Speed',
  description: 'Kategorie plus Buchstabe. Tippe blitzschnell einen gueltigen Treffer ein.',
  introChips: ['High-Speed', 'Wortschatz', 'Direkter Wettbewerb'],
  rounds: [
    { prompt: 'Tiere mit B', answer: 'Biber', accepted: ['Biber', 'Baer', 'Biene', 'Bussard'], chips: ['Kategorie: Tiere', 'Buchstabe: B'] },
    { prompt: 'Berufe mit M', answer: 'Maler', accepted: ['Maler', 'Musiker', 'Mechaniker', 'Metzger'], chips: ['Kategorie: Berufe', 'Buchstabe: M'] },
    { prompt: 'Dinge im Klassenzimmer mit T', answer: 'Tafel', accepted: ['Tafel', 'Tisch', 'Tasche', 'Textmarker'], chips: ['Schule', 'Buchstabe: T'] },
    { prompt: 'Verben mit S', answer: 'springen', accepted: ['springen', 'schreiben', 'singen', 'spielen'], chips: ['Verben', 'Buchstabe: S'] }
  ]
});

export const WortExplosionskette = createSolveGame({
  id: 'wort-explosionskette',
  name_de: 'Wort-Explosionskette',
  topics: ['wortschatz', 'wortbildung', 'lesen'],
  kicker: 'Kettenreaktion',
  description: 'Finde die Fortsetzung, die sauber an die Endsilbe andockt.',
  introChips: ['Silbenblick', 'Tempo', 'Party-Flow'],
  rounds: [
    { prompt: 'Haus -> ?', secondary: 'Das neue Wort muss mit "aus" beginnen.', answer: 'Ausgang', accepted: ['Ausgang'], options: ['Ausgang', 'Kiste', 'Maus'], chips: ['Endsilbe: aus'] },
    { prompt: 'Laterne -> ?', secondary: 'Suche die Folge mit "ne".', answer: 'Nebel', accepted: ['Nebel'], options: ['Nebel', 'Karte', 'Sonne'], chips: ['Endsilbe: ne'] },
    { prompt: 'Garten -> ?', secondary: 'Hier dockt "ten" an.', answer: 'Tennisschuh', accepted: ['Tennisschuh'], options: ['Tennisschuh', 'Lampe', 'Rucksack'], chips: ['Endsilbe: ten'] },
    { prompt: 'Tiger -> ?', secondary: 'Hier fuehrt "ger" weiter.', answer: 'Geruest', accepted: ['Geruest'], options: ['Geruest', 'Blume', 'Reiter'], chips: ['Endsilbe: ger'] }
  ]
});

export const SilbenReflex = createSolveGame({
  id: 'silben-reflex',
  name_de: 'Silben-Reflex',
  topics: ['silben', 'wortbildung', 'wortschatz'],
  kicker: 'Reflex',
  description: 'Die Silbe flasht auf. Tippe sofort ein passendes Wort.',
  introChips: ['Silben', 'Blitzreaktion', 'Sprachtempo'],
  rounds: [
    { prompt: 'ver-', answer: 'verkaufen', accepted: ['verkaufen', 'verstehen', 'verkleiden'], chips: ['Startsilbe'] },
    { prompt: 'auf-', answer: 'aufstehen', accepted: ['aufstehen', 'aufraeumen', 'aufmalen'], chips: ['Startsilbe'] },
    { prompt: 'Schnee-', answer: 'Schneemann', accepted: ['Schneemann', 'Schneeball', 'Schneeflocke'], chips: ['Wortbaustein'] },
    { prompt: 'spiel-', answer: 'Spielplatz', accepted: ['Spielplatz', 'Spielzeug', 'Spielhaus'], chips: ['Wortbaustein'] }
  ]
});

export const DefinitionReverse = createSolveGame({
  id: 'definition-reverse',
  name_de: 'Definition Reverse',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Brain',
  description: 'Schrullige Definition lesen und das richtige Wort entlarven.',
  introChips: ['Definitionen', 'Lesen', 'Schiefe Hinweise'],
  rounds: [
    {
      prompt: 'Welches Wort passt zu: "Der mobile Regenschutz fuer Menschen mit Stil"?',
      answer: 'Schirm',
      accepted: ['Schirm'],
      options: ['Schirm', 'Fenster', 'Stiefel'],
      chips: ['Schiefe Erklaerung']
    },
    {
      prompt: 'Welches Wort passt zu: "Ein kalter Kasten, der Essen in Winterschlaf schickt"?',
      answer: 'Kuehlschrank',
      accepted: ['Kuehlschrank'],
      options: ['Kuehlschrank', 'Toaster', 'Waschbecken'],
      chips: ['Schiefe Erklaerung']
    },
    {
      prompt: 'Welches Wort passt zu: "Das Ding, das du mit Kreide und Ideen fuetterst"?',
      answer: 'Tafel',
      accepted: ['Tafel'],
      options: ['Tafel', 'Lampe', 'Schublade'],
      chips: ['Schule']
    },
    {
      prompt: 'Welches Wort passt zu: "Ein Stoffhaus, das draussen Urlaub macht"?',
      answer: 'Zelt',
      accepted: ['Zelt'],
      options: ['Zelt', 'Sessel', 'Tasse'],
      chips: ['Abenteuer']
    }
  ]
});

export const WortEvolution = createSolveGame({
  id: 'wort-evolution',
  name_de: 'Wort-Evolution',
  topics: ['wortbildung', 'wortschatz'],
  kicker: 'Mutation',
  description: 'Ein Wort veraendert sich minimal. Waehl die gelungene neue Form.',
  introChips: ['Wortbildung', 'Transformation', 'Schnelles Denken'],
  rounds: [
    { prompt: 'Mach aus "laufen" ein Wort fuer "sich entfernen".', answer: 'weglaufen', accepted: ['weglaufen'], options: ['weglaufen', 'anlaufen', 'mitlaufen'], chips: ['Verb-Mutation'] },
    { prompt: 'Mach aus "Haus" ein Wort fuer die Tuer daran.', answer: 'Haustuer', accepted: ['Haustuer'], options: ['Haustuer', 'Hausbaum', 'Hauskind'], chips: ['Nomen-Mutation'] },
    { prompt: 'Mach aus "spielen" ein Wort fuer "gemeinsam mitmachen".', answer: 'mitspielen', accepted: ['mitspielen'], options: ['mitspielen', 'verspielen', 'abspielen'], chips: ['Verb-Mutation'] },
    { prompt: 'Mach aus "Schnee" ein Wort fuer eine kleine Kugel.', answer: 'Schneeball', accepted: ['Schneeball'], options: ['Schneeball', 'Schneekorb', 'Schneeseil'], chips: ['Nomen-Mutation'] }
  ]
});

export const AnagrammKampf = createSolveGame({
  id: 'anagramm-kampf',
  name_de: 'Anagramm-Kampf',
  topics: ['rechtschreibung', 'wortschatz'],
  kicker: 'Battle',
  description: 'Buchstabenmix lesen, Wort entwirren, Treffer setzen.',
  introChips: ['Anagramme', 'Schnelles Lesen', 'Kein Fueller'],
  rounds: [
    { prompt: 'TZEAK', answer: 'Katze', accepted: ['Katze'], chips: ['5 Buchstaben'] },
    { prompt: 'NSONE', answer: 'Sonne', accepted: ['Sonne'], chips: ['5 Buchstaben'] },
    { prompt: 'MLPAE', answer: 'Ampel', accepted: ['Ampel'], chips: ['5 Buchstaben'] },
    { prompt: 'RADDEHFA', answer: 'Fahrrad', accepted: ['Fahrrad'], chips: ['8 Buchstaben'] }
  ]
});

export const SilbenTetris = createSolveGame({
  id: 'silben-tetris',
  name_de: 'Silben-Tetris',
  topics: ['silben', 'wortbildung'],
  kicker: 'Bausteine',
  description: 'Silben sauber zusammensetzen, bevor der Stapel kippt.',
  introChips: ['Silben', 'Wortbau', 'Konzentration'],
  rounds: [
    { prompt: 'Baue aus "Ro | bo | ter" das richtige Wort.', answer: 'Roboter', accepted: ['Roboter'], options: ['Roboter', 'Torrobe', 'Botero'], chips: ['Silbenfall'] },
    { prompt: 'Baue aus "Ta | schen | lam | pe" das richtige Wort.', answer: 'Taschenlampe', accepted: ['Taschenlampe'], options: ['Taschenlampe', 'Lampentasche', 'Schentaschpe'], chips: ['Silbenfall'] },
    { prompt: 'Baue aus "Re | gen | bo | gen" das richtige Wort.', answer: 'Regenbogen', accepted: ['Regenbogen'], options: ['Regenbogen', 'Bogenregen', 'Genbogenre'], chips: ['Silbenfall'] },
    { prompt: 'Baue aus "Blu | men | topf" das richtige Wort.', answer: 'Blumentopf', accepted: ['Blumentopf'], options: ['Blumentopf', 'Topfblume', 'Menblutopf'], chips: ['Silbenfall'] }
  ]
});

export const AlliterationsKettenreaktion = createSolveGame({
  id: 'alliterations-kettenreaktion',
  name_de: 'Alliterations-Kettenreaktion',
  topics: ['wortschatz', 'satzbau'],
  kicker: 'Flow',
  description: 'Finde die Zeile, in der alles sauber mit demselben Buchstaben startet.',
  introChips: ['Alliteration', 'Rhythmus', 'Sprachgefuehl'],
  rounds: [
    { prompt: 'Welche Zeile haelt die Alliteration mit B?', answer: 'Bunte Baeren backen Brote', accepted: ['Bunte Baeren backen Brote'], options: ['Bunte Baeren backen Brote', 'Kluge Kinder lachen laut', 'Freche Fische tauchen'], chips: ['B-Linie'] },
    { prompt: 'Welche Zeile haelt die Alliteration mit S?', answer: 'Schnelle Schafe schieben Schlitten', accepted: ['Schnelle Schafe schieben Schlitten'], options: ['Schnelle Schafe schieben Schlitten', 'Leise Loewen schlafen lang', 'Mutige Maeuse malen'], chips: ['S-Linie'] },
    { prompt: 'Welche Zeile haelt die Alliteration mit K?', answer: 'Kleine Koalas kochen Kakao', accepted: ['Kleine Koalas kochen Kakao'], options: ['Kleine Koalas kochen Kakao', 'Wilde Wale winken', 'Bunte Bienen tanzen'], chips: ['K-Linie'] },
    { prompt: 'Welche Zeile haelt die Alliteration mit F?', answer: 'Freche Fuechse finden Federn', accepted: ['Freche Fuechse finden Federn'], options: ['Freche Fuechse finden Federn', 'Dicke Drachen drehen', 'Rote Rosen duften'], chips: ['F-Linie'] }
  ]
});

export const WortSchrumpfung = createSolveGame({
  id: 'wort-schrumpfung',
  name_de: 'Wort-Schrumpfung',
  topics: ['wortbildung', 'wortschatz'],
  kicker: 'Shrink',
  description: 'Kuerze das Wort so, dass der Sinn moeglichst elegant stehen bleibt.',
  introChips: ['Verdichten', 'Wortkern', 'Sinn behalten'],
  rounds: [
    { prompt: 'Welche Kurzform von "Autobahnfahrt" bleibt am staerksten im Sinn?', answer: 'Bahnfahrt', accepted: ['Bahnfahrt'], options: ['Bahnfahrt', 'Auto', 'Ahrt'], chips: ['Kern behalten'] },
    { prompt: 'Welche Kurzform von "Schulhofpause" klingt noch sinnvoll?', answer: 'Schulpause', accepted: ['Schulpause'], options: ['Schulpause', 'Hof', 'Schulpau'], chips: ['Kern behalten'] },
    { prompt: 'Welche Kurzform von "Schneeballschlacht" traegt das Bild noch?', answer: 'Schneeball', accepted: ['Schneeball'], options: ['Schneeball', 'Schlacht', 'Ballsch'], chips: ['Kern behalten'] },
    { prompt: 'Welche Kurzform von "Wasserflaschenregal" funktioniert am besten?', answer: 'Flaschenregal', accepted: ['Flaschenregal'], options: ['Flaschenregal', 'Wasser', 'Reg'], chips: ['Kern behalten'] }
  ]
});

const showcaseRatings = [
  { label: 'Wacklig', points: 1, tone: 'fail' },
  { label: 'Stark', points: 2, tone: 'mid' },
  { label: 'Legendär', points: 3, tone: 'success' }
];

export const MetaphernMaschine = createPromptShowgame({
  id: 'metaphern-maschine',
  name_de: 'Metaphern-Maschine',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Poetisch',
  description: 'Ein Begriff, eine Metapher, null Ausreden. Danach votet die Runde.',
  introChips: ['Kreativ', 'Sprache', 'Premium-Show'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Beschreibe "Freundschaft" als Wetter.', chips: ['Tiefgang', 'Bildsprache'] },
    { prompt: 'Beschreibe "Ferien" als Tier.', chips: ['Humor', 'Metapher'] },
    { prompt: 'Beschreibe "Schule" als Maschine.', chips: ['Kreativ', 'Bildsprache'] },
    { prompt: 'Beschreibe "Mut" als Musikstil.', chips: ['Poetisch', 'Mut zur Linie'] }
  ]
});

export const KategorieHacker = createPromptShowgame({
  id: 'kategorie-hacker',
  name_de: 'Kategorie-Hacker',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Mind Bend',
  description: 'Die Kategorie ist absichtlich kaputt. Gewinne mit der cleversten Antwort.',
  introChips: ['Querdenken', 'Absurde Kategorien', 'Party'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Nenne ein Tier, das kein Tier ist.', chips: ['Kategoriebruch', 'Kreativ'] },
    { prompt: 'Nenne ein Fahrzeug, das man eher liest als faehrt.', chips: ['Kategoriebruch', 'Wortspiel'] },
    { prompt: 'Nenne ein Lebensmittel, das wie ein Gefuehl klingt.', chips: ['Wortklang', 'Absurdität'] },
    { prompt: 'Nenne ein Verb, das wie ein Ort klingt.', chips: ['Sprachbruch', 'Mut'] }
  ]
});

export const DramatischerMonolog = createPromptShowgame({
  id: 'dramatischer-monolog',
  name_de: 'Dramatischer Monolog',
  topics: ['lesen', 'satzbau', 'wortschatz'],
  kicker: 'Performance',
  description: 'Drei Begriffe. Zehn Sekunden. Voller Einsatz oder kompletter Untergang.',
  introChips: ['Theater', 'Impro', 'Laut spielen'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Baue einen Monolog mit: Mond, Brotdose, Geheimtuer.', chips: ['3 Woerter', '10 Sekunden'] },
    { prompt: 'Baue einen Monolog mit: Hausaufgabe, Vulkan, Kaugummi.', chips: ['3 Woerter', '10 Sekunden'] },
    { prompt: 'Baue einen Monolog mit: Ritter, Mathetest, Saft.', chips: ['3 Woerter', '10 Sekunden'] },
    { prompt: 'Baue einen Monolog mit: Schultasche, Sturm, Goldfisch.', chips: ['3 Woerter', '10 Sekunden'] }
  ]
});

export const UntertitelDesaster = createPromptShowgame({
  id: 'untertitel-desaster',
  name_de: 'Untertitel-Desaster',
  topics: ['lesen', 'satzbau'],
  kicker: 'Live-Dub',
  description: 'Eine Szene wird absurd. Untertitelt sie live mit maximalem Chaos.',
  introChips: ['Live', 'Humor', 'Timing'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Untertitele einen Ritter, der heimlich Angst vor Enten hat.', chips: ['Filmfeeling', 'Impro'] },
    { prompt: 'Untertitele einen Drachen, der Mathehausaufgaben erklaert.', chips: ['Filmfeeling', 'Impro'] },
    { prompt: 'Untertitele einen Schatzsucher, der seinen Rucksack verliert.', chips: ['Szene', 'Timing'] },
    { prompt: 'Untertitele eine Lehrerin, die ploetzlich Piratin wird.', chips: ['Szene', 'Humor'] }
  ]
});

export const GefuehlGegenteil = createPromptShowgame({
  id: 'gefuehl-gegenteil',
  name_de: 'Gefuehl + Gegenteil',
  topics: ['wortschatz', 'satzbau'],
  kicker: 'Kontrast',
  description: 'Sag den Satz in der falschen Stimmung. Je sauberer der Widerspruch, desto besser.',
  introChips: ['Emotion', 'Kontrast', 'Showtime'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Sag "Ich freue mich riesig" so, als waerst du wuetend.', chips: ['Emotion', 'Gegenteil'] },
    { prompt: 'Sag "Das war knapp" so, als waerst du total gelangweilt.', chips: ['Emotion', 'Gegenteil'] },
    { prompt: 'Sag "Wir haben gewonnen" so, als waerst du tieftraurig.', chips: ['Emotion', 'Gegenteil'] },
    { prompt: 'Sag "Bitte leise sein" wie ein Rockstar auf Tour.', chips: ['Emotion', 'Buehne'] }
  ]
});

export const StimmBattle = createPromptShowgame({
  id: 'stimm-battle',
  name_de: 'Stimm-Battle',
  topics: ['lesen', 'satzbau'],
  kicker: 'Voice',
  description: 'Eine Phrase, mehrere Stimmen. Die Runde votet die staerkste Performance.',
  introChips: ['Stimme', 'Performance', 'Battle'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Sprich "Heute ist mein Tag" wie ein Sportkommentator.', chips: ['Stimme', 'Battle'] },
    { prompt: 'Sprich "Wo ist meine Socke?" wie ein Filmboesewicht.', chips: ['Stimme', 'Battle'] },
    { prompt: 'Sprich "Das ist nur ein Toast" wie eine Nachrichtensprecherin.', chips: ['Stimme', 'Battle'] },
    { prompt: 'Sprich "Ich habe keine Angst" wie ein Ritter mit zittrigen Knien.', chips: ['Stimme', 'Battle'] }
  ]
});

export const GemeinsameLuege = createPromptShowgame({
  id: 'gemeinsame-luege',
  name_de: 'Gemeinsame Luege',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Bluff',
  description: 'Die Gruppe baut gemeinsam eine Fake-Definition. Danach wird bewertet, wie glaubhaft sie wirkte.',
  introChips: ['Bluff', 'Social', 'Definitionen'],
  ratings: [
    { label: 'Aufgeflogen', points: 1, tone: 'fail' },
    { label: 'Fast verkauft', points: 2, tone: 'mid' },
    { label: 'Alle getaeuscht', points: 3, tone: 'success' }
  ],
  rounds: [
    { prompt: 'Erfindet gemeinsam eine Definition fuer "Knisterling".', chips: ['Obskures Wort', 'Gruppenluege'] },
    { prompt: 'Erfindet gemeinsam eine Definition fuer "Flauschkern".', chips: ['Obskures Wort', 'Gruppenluege'] },
    { prompt: 'Erfindet gemeinsam eine Definition fuer "Wirbelglas".', chips: ['Obskures Wort', 'Gruppenluege'] },
    { prompt: 'Erfindet gemeinsam eine Definition fuer "Schattenmuetze".', chips: ['Obskures Wort', 'Gruppenluege'] }
  ]
});

export const WortVerraeter = createPromptShowgame({
  id: 'wort-verraeter',
  name_de: 'Wort-Verräter',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Hidden Role',
  description: 'Einer kennt die Kategorie nicht. Die Runde bewertet, ob der Verräter mithalten konnte.',
  introChips: ['Sozial', 'Verdacht', 'Hinweise'],
  ratings: [
    { label: 'Sofort entlarvt', points: 1, tone: 'fail' },
    { label: 'Knapp ueberlebt', points: 2, tone: 'mid' },
    { label: 'Komplett durchgemogelt', points: 3, tone: 'success' }
  ],
  rounds: [
    { prompt: 'Kategorie fuer die Runde: Dinge im Badezimmer.', chips: ['Hidden Role', 'Hinweisrunde'] },
    { prompt: 'Kategorie fuer die Runde: Geraeusche in der Schule.', chips: ['Hidden Role', 'Hinweisrunde'] },
    { prompt: 'Kategorie fuer die Runde: Dinge bei einem Campingtrip.', chips: ['Hidden Role', 'Hinweisrunde'] },
    { prompt: 'Kategorie fuer die Runde: Dinge in einem Hexenlabor.', chips: ['Hidden Role', 'Hinweisrunde'] }
  ]
});

export const RankingChaos = createPromptShowgame({
  id: 'ranking-chaos',
  name_de: 'Ranking-Chaos',
  topics: ['wortschatz', 'lesen'],
  kicker: 'Mehrheit',
  description: 'Ordnet Begriffe so, dass ihr moeglichst nah an der Mehrheitsmeinung landet.',
  introChips: ['Sozial', 'Mehrheit lesen', 'Diskussion'],
  ratings: [
    { label: 'Chaos pur', points: 1, tone: 'fail' },
    { label: 'Fast Mehrheit', points: 2, tone: 'mid' },
    { label: 'Perfekt getroffen', points: 3, tone: 'success' }
  ],
  rounds: [
    { prompt: 'Sortiert diese Dinge nach Kuschelfaktor: Kaktus, Kissen, Katze, Karton.', chips: ['Ranking', 'Mehrheit'] },
    { prompt: 'Sortiert nach Mutprobe: Wurm, Karaoke, Geisterbahn, Referat.', chips: ['Ranking', 'Mehrheit'] },
    { prompt: 'Sortiert nach Ferienvibe: Eis, Mathebuch, Zelt, Sonnenbrille.', chips: ['Ranking', 'Mehrheit'] },
    { prompt: 'Sortiert nach Lautstaerke: Fluestern, Toaster, Gewitter, Tick-Tack.', chips: ['Ranking', 'Mehrheit'] }
  ]
});

export const RegelFlip = createPromptShowgame({
  id: 'regel-flip',
  name_de: 'Regel-Flip',
  topics: ['lesen', 'konzentration'],
  kicker: 'Twist',
  description: 'Mitten in der Aufgabe kippt die Regel. Wer schnell umschaltet, ueberlebt.',
  introChips: ['Chaos', 'Regelwechsel', 'Konzentration'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Zuerst nur Nomen nennen. Dann kippt die Regel.', twist: 'Ab jetzt nur noch Verben nennen.', chips: ['Regel-Flip', 'Spontan bleiben'] },
    { prompt: 'Beginne mit freundlichen Antworten.', twist: 'Ab jetzt muss alles geheimnisvoll klingen.', chips: ['Regel-Flip', 'Tone Shift'] },
    { prompt: 'Erzaehle streng in der Vergangenheit.', twist: 'Ab jetzt springst du in die Zukunft.', chips: ['Regel-Flip', 'Zeitwechsel'] },
    { prompt: 'Starte ganz leise.', twist: 'Ab jetzt nur noch wie eine Stadiondurchsage.', chips: ['Regel-Flip', 'Lautstaerke'] }
  ]
});

export const Zeitlupe = createPromptShowgame({
  id: 'zeitlupe',
  name_de: 'Zeitlupe',
  topics: ['lesen', 'satzbau'],
  kicker: 'Slow Motion',
  description: 'Alles extrem langsam. Die Spannung kommt aus der Kontrolle.',
  introChips: ['Zeitlupe', 'Spannung', 'Performance'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Sag "Ich habe den Schatz gefunden" in maximaler Zeitlupe.', chips: ['Slow Motion'] },
    { prompt: 'Erzaehle in Zeitlupe, warum du zu spaet warst.', chips: ['Slow Motion'] },
    { prompt: 'Bitte um einen Keks, als waere jede Silbe aus Gold.', chips: ['Slow Motion'] },
    { prompt: 'Stell dich in Zeitlupe als Superheld vor.', chips: ['Slow Motion'] }
  ]
});

export const Overload = createPromptShowgame({
  id: 'overload',
  name_de: 'Overload',
  topics: ['wortschatz', 'satzbau', 'konzentration'],
  kicker: 'Triple Task',
  description: 'Drei Anforderungen gleichzeitig. Ueberlebt nur, wer Rhythmus und Kopf zusammenhaelt.',
  introChips: ['3 Aufgaben', 'Maximalstress', 'Premium'],
  ratings: showcaseRatings,
  rounds: [
    { prompt: 'Sprich reimend, nenne ein Tier und klinge dabei wie im Horrorfilm.', chips: ['3 Ebenen', 'Overload'] },
    { prompt: 'Sag einen Satz ueber Schule, aber nur mit W-Woertern und im Fluesterton.', chips: ['3 Ebenen', 'Overload'] },
    { prompt: 'Erzaehle etwas ueber Ferien, benutze ein Verb pro Satz und bleib gleichzeitig sehr dramatisch.', chips: ['3 Ebenen', 'Overload'] },
    { prompt: 'Beschreibe ein Essen, nutze eine Metapher und ende auf denselben Buchstaben.', chips: ['3 Ebenen', 'Overload'] }
  ]
});

export const PublikumsManipulation = createPromptShowgame({
  id: 'publikums-manipulation',
  name_de: 'Publikums-Manipulation',
  topics: ['lesen', 'wortschatz'],
  kicker: 'Mind Game',
  description: 'Ueberzeuge die Runde, obwohl du eigentlich keinen guten Grund hast.',
  introChips: ['Vote Control', 'Rhetorik', 'Party-Spiel'],
  ratings: [
    { label: 'Niemand gekauft', points: 1, tone: 'fail' },
    { label: 'Ein paar erwischt', points: 2, tone: 'mid' },
    { label: 'Komplett manipuliert', points: 3, tone: 'success' }
  ],
  rounds: [
    { prompt: 'Ueberzeuge die Runde, dass Toast das beste Reisegepaeck ist.', chips: ['Persuasion', 'Absurdität'] },
    { prompt: 'Ueberzeuge die Runde, dass Mathehausaufgaben ein Freizeitpark sind.', chips: ['Persuasion', 'Absurdität'] },
    { prompt: 'Ueberzeuge die Runde, dass Regen das beste Geburtstagsgeschenk ist.', chips: ['Persuasion', 'Absurdität'] },
    { prompt: 'Ueberzeuge die Runde, dass Socken ein starkes Haustier waeren.', chips: ['Persuasion', 'Absurdität'] }
  ]
});
