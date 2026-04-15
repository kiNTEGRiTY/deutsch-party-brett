/**
 * German Content Module - Lesen (Reading Comprehension)
 * 
 * Short texts with comprehension questions
 */

export const LESEN_CONTENT = {
  // Short reading texts with questions
  readingTexts: {
    easy: [
      {
        title: 'Im Park',
        text: 'Lisa geht mit ihrem Hund Bello in den Park. Bello spielt gerne mit dem Ball. Lisa wirft den Ball und Bello bringt ihn zurück. Danach essen sie ein Eis.',
        questions: [
          { question: 'Wie heißt der Hund?', correct: 'Bello', options: ['Bello', 'Rex', 'Fido', 'Waldi'] },
          { question: 'Womit spielt Bello?', correct: 'Mit dem Ball', options: ['Mit dem Ball', 'Mit einem Stock', 'Mit einer Katze', 'Mit einem Knochen'] },
          { question: 'Was essen sie danach?', correct: 'Ein Eis', options: ['Ein Eis', 'Einen Kuchen', 'Pizza', 'Brot'] }
        ]
      },
      {
        title: 'Die neue Schule',
        text: 'Tom ist neu in der Schule. Er ist aufgeregt. Seine Lehrerin heißt Frau Müller. Sie ist nett. Tom findet schnell einen Freund. Er heißt Max.',
        questions: [
          { question: 'Wer ist neu in der Schule?', correct: 'Tom', options: ['Tom', 'Max', 'Frau Müller', 'Lisa'] },
          { question: 'Wie heißt die Lehrerin?', correct: 'Frau Müller', options: ['Frau Müller', 'Frau Schmidt', 'Frau Fischer', 'Frau Weber'] },
          { question: 'Wie heißt Toms neuer Freund?', correct: 'Max', options: ['Max', 'Paul', 'Bello', 'Tim'] }
        ]
      }
    ],
    medium: [
      {
        title: 'Der Ausflug',
        text: 'Die Klasse 2b macht einen Ausflug zum Bauernhof. Die Kinder sehen Kühe, Schweine und Hühner. Der Bauer zeigt ihnen, wie man Käse macht. Am besten gefällt Emma das kleine Fohlen. Es ist erst zwei Wochen alt. Zum Schluss bekommen alle ein Glas frische Milch.',
        questions: [
          { question: 'Wohin macht die Klasse einen Ausflug?', correct: 'Zum Bauernhof', options: ['Zum Bauernhof', 'In den Zoo', 'Ins Museum', 'In den Wald'] },
          { question: 'Was zeigt der Bauer den Kindern?', correct: 'Wie man Käse macht', options: ['Wie man Käse macht', 'Wie man reitet', 'Wie man pflügt', 'Wie man backt'] },
          { question: 'Was gefällt Emma am besten?', correct: 'Das Fohlen', options: ['Das Fohlen', 'Die Kühe', 'Die Schweine', 'Die Hühner'] },
          { question: 'Was bekommen die Kinder zum Schluss?', correct: 'Ein Glas Milch', options: ['Ein Glas Milch', 'Ein Eis', 'Einen Apfel', 'Ein Käsebrot'] }
        ]
      }
    ]
  }
};
