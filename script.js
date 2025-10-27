// Pequeno utilitário: salvar e ler do localStorage
const store = {
  key: 'todo-app-v1',
  read() { try { return JSON.parse(localStorage.getItem(this.key)) ?? []; } catch { return []; } },
  write(data) { localStorage.setItem(this.key, JSON.stringify(data)); }
};

// Estado da aplicação
let todos = store.read();
let filter = 'all'; // all | open | done

// Elementos de UI
const $list = document.getElementById('todo-list');
const $form = document.getElementById('todo-form');
const $input = document.getElementById('todo-input');
const $counter = document.getElementById('counter');
const $clearDone = document.getElementById('clear-done');
const $search = document.getElementById('search');
const $filters = document.querySelector('.filters');
const $toggleTheme = document.getElementById('toggle-theme');

// Renderização
function render() {
  const query = $search.value.trim().toLowerCase();
  const filtered = todos.filter(t => {
    const passFilter =
      filter === 'all' ? true :
      filter === 'open' ? !t.done :
      t.done;
    const passQuery = t.text.toLowerCase().includes(query);
    return passFilter && passQuery;
  });

  $list.innerHTML = '';
  for (const t of filtered) {
    const li = document.createElement('li');
    li.className = 'todo' + (t.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done;
    checkbox.addEventListener('change', () => toggle(t.id));

    const label = document.createElement('label');
    const span = document.createElement('span');
    span.className = 'text';
    span.textContent = t.text;
    label.append(checkbox, span);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const editBtn = button('✏️', () => edit(t.id));
    const delBtn = button('🗑️', () => remove(t.id), 'delete');
    actions.append(editBtn, delBtn);

    li.append(label, actions);
    $list.append(li);
  }

  const open = todos.filter(t => !t.done).length;
  const total = todos.length;
  $counter.textContent = `${total} ${total === 1 ? 'tarefa' : 'tarefas'} (${open} abertas)`;
  store.write(todos);
}

function button(label, onClick, extraClass='') {
  const b = document.createElement('button');
  b.className = 'icon ' + extraClass;
  b.type = 'button';
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

// CRUD
function add(text) {
  const t = { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() };
  todos.unshift(t);
  render();
}
function toggle(id) {
  const t = todos.find(x => x.id === id);
  if (t) t.done = !t.done;
  render();
}
function edit(id) {
  const t = todos.find(x => x.id === id);
  if (!t) return;
  const next = prompt('Editar tarefa:', t.text);
  if (next && next.trim()) { t.text = next.trim(); render(); }
}
function remove(id) {
  todos = todos.filter(x => x.id !== id);
  render();
}

// Eventos
$form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $input.value.trim();
  if (!text) return;
  add(text);
  $input.value = '';
  $input.focus();
});
$clearDone.addEventListener('click', () => {
  todos = todos.filter(t => !t.done);
  render();
});
$filters.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filter = btn.dataset.filter;
  render();
});
$search.addEventListener('input', render);

// Tema claro/escuro com persistência
const THEME_KEY = 'todo-theme';
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
}
function getTheme() { return localStorage.getItem(THEME_KEY) || 'dark'; }
function setTheme(theme) { localStorage.setItem(THEME_KEY, theme); }
applyTheme(getTheme());
$toggleTheme.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  applyTheme(next);
});

// Inicialização
render();
