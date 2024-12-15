const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session'); // Убедитесь, что строка присутствует только один раз
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, '../client')));

// Вопросы (пример)
const questions = [
  {
    id: 1,
    question: "Какой вид кошек считается самым крупным среди домашних?",
    answers: [
      { id: 1, answer: "Мейн-кун", correct: true },
      { id: 2, answer: "Сиамская", correct: false },
      { id: 3, answer: "Персидская", correct: false },
      { id: 4, answer: "Британская", correct: false }
    ]
  },
  {
    id: 2,
    question: "Какое чувство обоняния у кошек по сравнению с людьми?",
    answers: [
      { id: 1, answer: "В 14 раз сильнее", correct: true },
      { id: 2, answer: "Такое же", correct: false },
      { id: 3, answer: "Слабее", correct: false },
      { id: 4, answer: "В 2 раза сильнее", correct: false }
    ]
  },
  {
    id: 3,
    question: "Сколько пальцев на передних лапах у большинства кошек?",
    answers: [
      { id: 1, answer: "4", correct: false },
      { id: 2, answer: "5", correct: true },
      { id: 3, answer: "6", correct: false },
      { id: 4, answer: "3", correct: false }
    ]
  },
  {
    id: 4,
    question: "Какой орган кошка использует для общения с людьми?",
    answers: [
      { id: 1, answer: "Мяуканье", correct: true },
      { id: 2, answer: "Жесты", correct: false },
      { id: 3, answer: "Шипение", correct: false },
      { id: 4, answer: "Мурлыканье", correct: false }
    ]
  },
  {
    id: 5,
    question: "Кошки видят лучше всего в каком освещении?",
    answers: [
      { id: 1, answer: "Полная темнота", correct: false },
      { id: 2, answer: "Яркий солнечный свет", correct: false },
      { id: 3, answer: "Тусклый свет", correct: true },
      { id: 4, answer: "При свете свечей", correct: false }
    ]
  },
  {
    id: 6,
    question: "Сколько кошек может быть у одного кота в одном помете?",
    answers: [
      { id: 1, answer: "1-3", correct: false },
      { id: 2, answer: "4-6", correct: true },
      { id: 3, answer: "7-10", correct: false },
      { id: 4, answer: "Более 10", correct: false }
    ]
  },
  {
    id: 7,
    question: "Как называется группа кошек?",
    answers: [
      { id: 1, answer: "Котячий прайд", correct: false },
      { id: 2, answer: "Стая", correct: false },
      { id: 3, answer: "Ковен", correct: false },
      { id: 4, answer: "Колония", correct: true }
    ]
  },
  {
    id: 8,
    question: "Почему кошки мурлыкают?",
    answers: [
      { id: 1, answer: "Чтобы общаться", correct: false },
      { id: 2, answer: "Когда они счастливы или испытывают стресс", correct: true },
      { id: 3, answer: "Для того чтобы привлечь внимание", correct: false },
      { id: 4, answer: "Это их способ сказать «нет»", correct: false }
    ]
  },
  {
    id: 9,
    question: "Сколько лет, в среднем, живут домашние кошки?",
    answers: [
      { id: 1, answer: "5-7 лет", correct: false },
      { id: 2, answer: "10-15 лет", correct: true },
      { id: 3, answer: "20-25 лет", correct: false },
      { id: 4, answer: "Более 30 лет", correct: false }
    ]
  },
  {
    id: 10,
    question: "Какая порода кошек не имеет шерсти?",
    answers: [
      { id: 1, answer: "Сфинкс", correct: true },
      { id: 2, answer: "Британская короткошерстная", correct: false },
      { id: 3, answer: "Бенгальская", correct: false },
      { id: 4, answer: "Персидская", correct: false }
    ]
  }
];

// Хранилище тестов
let testHistory = [];

// Получение вопросов
app.get('/questions', (req, res) => {
  res.json(questions);
});

// Отправка ответов
app.post('/submit-answers', (req, res) => {
  const { answers } = req.body;

  const results = answers.map(userAnswer => {
    const question = questions.find(q => q.id === userAnswer.questionId);
    if (!question) return { questionId: userAnswer.questionId, correct: false, correctAnswers: [] };

    const correctAnswers = question.answers.filter(a => a.correct).map(a => a.id);
    const isCorrect =
      JSON.stringify(correctAnswers.sort()) === JSON.stringify(userAnswer.selectedAnswers.sort());

    return {
      questionId: userAnswer.questionId,
      correct: isCorrect,
      correctAnswers: correctAnswers // Добавляем правильные ответы
    };
  });

  if (!req.session.testHistory) {
    req.session.testHistory = [];
  }
  req.session.testHistory.push(results);
  res.json({ results });
});

// Получение истории
// Получение истории тестов
app.get('/history', (req, res) => {
  if (!req.session.testHistory) {
    return res.json({ history: [] }); // Возвращаем пустой массив, если истории нет
  }
  res.json({ history: req.session.testHistory });
});


// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});