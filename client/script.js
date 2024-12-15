const apiUrl = 'http://localhost:3000';

// Функция для загрузки вопросов
async function loadQuestions() {
  try {
    const response = await fetch(`${apiUrl}/questions`);
    if (!response.ok) throw new Error("Ошибка загрузки вопросов с сервера");

    const questions = await response.json();
    console.log("Полученные вопросы:", questions);

    const container = document.getElementById('test-container');
    container.innerHTML = '';

    questions.forEach(question => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question';
      questionDiv.dataset.questionId = question.id; // Добавляем атрибут questionId

      const questionText = document.createElement('p');
      questionText.textContent = question.question;

      const answersList = document.createElement('ul');
      question.answers.forEach(answer => {
        const answerItem = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = answer.id;

        const label = document.createElement('label');
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(answer.answer));

        answerItem.appendChild(label);
        answersList.appendChild(answerItem);
      });

      questionDiv.appendChild(questionText);
      questionDiv.appendChild(answersList);
      container.appendChild(questionDiv);
    });
  } catch (error) {
    console.error("Ошибка загрузки вопросов:", error.message);
    alert("Не удалось загрузить вопросы. Проверьте сервер.");
  }
}

// Функция для отправки ответов
document.getElementById('submit-button').addEventListener('click', async () => {
  try {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const answers = [];

    checkboxes.forEach(checkbox => {
      const questionId = checkbox.closest('.question').dataset.questionId;
      if (!questionId) return;

      let answer = answers.find(a => a.questionId === parseInt(questionId));
      if (!answer) {
        answer = { questionId: parseInt(questionId), selectedAnswers: [] };
        answers.push(answer);
      }
      if (checkbox.checked) {
        answer.selectedAnswers.push(parseInt(checkbox.value));
      }
    });

    console.log("Отправляемые ответы:", answers);

    const response = await fetch(`${apiUrl}/submit-answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers })
    });

    if (!response.ok) throw new Error("Ошибка при отправке ответов");

    const result = await response.json();
    console.log("Полученные результаты:", result);

    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (result.incomplete) {
      resultContainer.innerHTML = '<p class="warning">Тест не завершен. Ответьте на все вопросы.</p>';
      return;
    }

    resultContainer.innerHTML += '<h2>Результаты</h2>';
    result.results.forEach(r => {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';
      resultItem.innerHTML = `
        <p>Вопрос ${r.questionId}: ${r.correct ? 'Верно' : 'Неверно'}</p>
      `;
      resultContainer.appendChild(resultItem);
    });
  } catch (error) {
    console.error("Ошибка при отправке данных:", error.message);
    alert("Произошла ошибка при отправке данных на сервер.");
  }
});

// Функция для загрузки истории тестов
async function loadHistory() {
  try {
    const response = await fetch(`${apiUrl}/history`);
    if (!response.ok) throw new Error("Ошибка загрузки истории тестов");

    const data = await response.json();
    console.log("История тестов:", data.history);

    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '<h2>История тестов</h2>';

    if (data.history.length === 0) {
      historyContainer.innerHTML += '<p>История тестов пуста.</p>';
      return;
    }

    data.history.forEach((test, index) => {
      const testDiv = document.createElement('div');
      testDiv.className = 'history-item';
      testDiv.innerHTML = `
        <h3>Тест №${index + 1}</h3>
        ${test.map(result => `
          <p>Вопрос ${result.questionId}: ${result.correct ? 'Верно' : 'Неверно'}</p>
        `).join('')}
      `;
      historyContainer.appendChild(testDiv);
    });
  } catch (error) {
    console.error("Ошибка при загрузке истории:", error.message);
    alert("Не удалось загрузить историю тестов.");
  }
}

// Добавляем обработчик для кнопки "Просмотреть историю"
document.getElementById('history-button').addEventListener('click', loadHistory);

// Загружаем вопросы при загрузке страницы
window.onload = loadQuestions;
