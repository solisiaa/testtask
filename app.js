const storageKey = 'todo-list.tasks.v1';
const form = document.querySelector('form');
const taskInput = document.querySelector('#task');
const list = document.querySelector('ul');
const count = document.querySelector('#count');
const progress = document.querySelector('#progress');
const empty = document.querySelector('#empty');
const error = document.querySelector('#error');

let tasks = [];
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
  if (Array.isArray(saved)) {
    tasks = saved.filter(task => typeof task?.text === 'string' && typeof task.done === 'boolean');
  }
} catch {
  showError('Не удалось загрузить сохранённые задачи.');
}

function showError(message) {
  error.textContent = message;
  error.hidden = !message;
}

function save(nextTasks) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(nextTasks));
  } catch {
    showError('Не удалось сохранить изменения. Проверьте настройки хранилища браузера.');
    return false;
  }
  tasks = nextTasks;
  showError('');
  return true;
}

function updateSummary() {
  empty.hidden = tasks.length > 0;
  const completed = tasks.filter(task => task.done).length;
  count.textContent = `Выполнено: ${completed} из ${tasks.length}`;
  progress.max = tasks.length || 1;
  progress.value = completed;
}

function createRow(task) {
  const row = document.createElement('li');
  const label = document.createElement('label');
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.done;

  const title = document.createElement('span');
  title.textContent = task.text;
  label.append(checkbox, title);

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Удалить';
  remove.setAttribute('aria-label', `Удалить задачу «${task.text}»`);

  let currentTask = task;
  checkbox.addEventListener('change', () => {
    const updated = { ...currentTask, done: checkbox.checked };
    if (save(tasks.map(item => item === currentTask ? updated : item))) {
      currentTask = updated;
      updateSummary();
    } else {
      checkbox.checked = currentTask.done;
    }
  });

  remove.addEventListener('click', () => {
    if (save(tasks.filter(item => item !== currentTask))) {
      const nextRow = row.nextElementSibling ?? row.previousElementSibling;
      row.remove();
      updateSummary();
      (nextRow?.querySelector('button') ?? taskInput).focus();
    }
  });

  row.append(label, remove);
  return row;
}

taskInput.addEventListener('input', () => taskInput.setCustomValidity(''));
form.addEventListener('submit', event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.setCustomValidity('Введите название задачи.');
    taskInput.reportValidity();
    return;
  }

  const task = { text, done: false };
  if (save([...tasks, task])) {
    list.append(createRow(task));
    updateSummary();
    form.reset();
    taskInput.focus();
  }
});

list.append(...tasks.map(createRow));
updateSummary();
