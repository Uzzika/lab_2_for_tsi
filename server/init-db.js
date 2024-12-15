const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // Create tables
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    answer TEXT NOT NULL,
    correct BOOLEAN,
    FOREIGN KEY (question_id) REFERENCES questions (id)
  )`);

  // Clear existing data
  db.run(`DELETE FROM questions`);
  db.run(`DELETE FROM answers`);

  // Prepare statements
  const insertQuestion = db.prepare(`INSERT INTO questions (question) VALUES (?)`);
  const insertAnswer = db.prepare(`INSERT INTO answers (question_id, answer, correct) VALUES (?, ?, ?)`);

  // Array of questions and answers
  const data = [
    {
      question: "Какой вид кошек считается самым крупным среди домашних?",
      answers: [
        { answer: "Мейн-кун", correct: true },
        { answer: "Сиамская", correct: false },
        { answer: "Персидская", correct: false },
        { answer: "Британская", correct: false }
      ]
    },
    {
      question: "Какое чувство обоняния у кошек по сравнению с людьми?",
      answers: [
        { answer: "В 14 раз сильнее", correct: true },
        { answer: "Такое же", correct: false },
        { answer: "Слабее", correct: false },
        { answer: "В 2 раза сильнее", correct: false }
      ]
    },
    {
      question: "Сколько пальцев на передних лапах у большинства кошек?",
      answers: [
        { answer: "4", correct: false },
        { answer: "5", correct: true },
        { answer: "6", correct: false },
        { answer: "3", correct: false }
      ]
    },
    {
      question: "Какой орган кошка использует для общения с людьми?",
      answers: [
        { answer: "Мяуканье", correct: true },
        { answer: "Жесты", correct: false },
        { answer: "Шипение", correct: false },
        { answer: "Мурлыканье", correct: false }
      ]
    },
    {
      question: "Кошки видят лучше всего в каком освещении?",
      answers: [
        { answer: "Полная темнота", correct: false },
        { answer: "Яркий солнечный свет", correct: false },
        { answer: "Тусклый свет", correct: true },
        { answer: "При свете свечей", correct: false }
      ]
    },
    {
      question: "Сколько котят может быть у кошки в одном помете?",
      answers: [
        { answer: "1-3", correct: false },
        { answer: "4-6", correct: true },
        { answer: "7-10", correct: false },
        { answer: "Более 10", correct: false }
      ]
    },
    {
      question: "Как называется группа кошек?",
      answers: [
        { answer: "Котячий прайд", correct: false },
        { answer: "Стая", correct: false },
        { answer: "Ковен", correct: false },
        { answer: "Колония", correct: true }
      ]
    },
    {
      question: "Почему кошки мурлыкают?",
      answers: [
        { answer: "Чтобы общаться", correct: false },
        { answer: "Когда они счастливы или испытывают стресс", correct: true },
        { answer: "Для того чтобы привлечь внимание", correct: false },
        { answer: "Это их способ сказать «нет»", correct: false }
      ]
    },
    {
      question: "Сколько лет, в среднем, живут домашние кошки?",
      answers: [
        { answer: "5-7 лет", correct: false },
        { answer: "10-15 лет", correct: true },
        { answer: "20-25 лет", correct: false },
        { answer: "Более 30 лет", correct: false }
      ]
    },
    {
      question: "Какая порода кошек не имеет шерсти?",
      answers: [
        { answer: "Сфинкс", correct: true },
        { answer: "Британская короткошерстная", correct: false },
        { answer: "Бенгальская", correct: false },
        { answer: "Персидская", correct: false }
      ]
    }
  ];

  // Function to insert questions and answers sequentially
  function insertData(index) {
    if (index >= data.length) {
      // Finalize statements and close database
      insertQuestion.finalize();
      insertAnswer.finalize();
      db.close();
      console.log("Database initialized successfully.");
      return;
    }

    const item = data[index];
    insertQuestion.run(item.question, function(err) {
      if (err) {
        console.error('Error inserting question:', err.message);
        return;
      }
      const questionId = this.lastID;

      // Insert answers for this question
      const answers = item.answers;
      let answerIndex = 0;

      function insertNextAnswer() {
        if (answerIndex >= answers.length) {
          // Proceed to next question
          insertData(index + 1);
          return;
        }

        const answer = answers[answerIndex];
        insertAnswer.run(questionId, answer.answer, answer.correct, function(err) {
          if (err) {
            console.error('Error inserting answer:', err.message);
            return;
          }
          answerIndex++;
          insertNextAnswer();
        });
      }

      insertNextAnswer();
    });
  }

  // Start insertion process
  insertData(0);
});
