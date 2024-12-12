const apiUrl = 'http://localhost:3000'; // URL сервера

// Функция для загрузки вопросов
async function loadQuestions() {
  const response = await fetch(`${apiUrl}/questions`);
  const questions = await response.json();

  const container = document.getElementById('test-container');
  container.innerHTML = '';

  questions.forEach(question => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question';

    const questionText = document.createElement('p');
    questionText.textContent = question.question;
    questionDiv.appendChild(questionText);

    const answersList = document.createElement('ul');
    question.answers.forEach(answer => {
      const answerItem = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = answer.id;
      checkbox.dataset.questionId = question.id;

      const label = document.createElement('label');
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(answer.answer));
      answerItem.appendChild(label);

      answersList.appendChild(answerItem);
    });

    questionDiv.appendChild(answersList);
    container.appendChild(questionDiv);
  });
}

// Обработчик для отправки ответов
document.getElementById('submit-button').addEventListener('click', async () => {
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const answers = [];

  checkboxes.forEach(checkbox => {
    const questionId = parseInt(checkbox.dataset.questionId);
    if (!answers.find(a => a.questionId === questionId)) {
      answers.push({ questionId, selectedAnswers: [] });
    }

    if (checkbox.checked) {
      const answer = answers.find(a => a.questionId === questionId);
      answer.selectedAnswers.push(parseInt(checkbox.value));
    }
  });

  const response = await fetch(`${apiUrl}/submit-answers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers })
  });

  const result = await response.json();
  const resultContainer = document.getElementById('result-container');
  resultContainer.innerHTML = ''; // Очищаем контейнер перед выводом

  // Если тест не завершен, выводим сообщение и ничего больше
  if (result.incomplete) {
    const warningMessage = document.createElement('div');
    warningMessage.style.color = 'red';
    warningMessage.style.fontWeight = 'bold';
    warningMessage.style.marginBottom = '20px';
    warningMessage.textContent = "Тест не закончен, просим продолжить прохождение";
    resultContainer.appendChild(warningMessage);
    return; // Завершаем обработку
  }

  // Если тест завершен, выводим результаты
  resultContainer.innerHTML += '<h2>Результаты</h2>';
  result.results.forEach(r => {
    const resultItem = document.createElement('div');
    resultItem.className = 'result-item';
    resultItem.innerHTML = `
      <p>Вопрос ${r.questionId}: ${r.correct ? 'Верно' : 'Неверно'}</p>
      <p><strong>Правильные ответы:</strong> ${r.correctAnswers.join(', ')}</p>
    `;
    resultContainer.appendChild(resultItem);
  });
});

// Загружаем вопросы при загрузке страницы
window.onload = loadQuestions;
