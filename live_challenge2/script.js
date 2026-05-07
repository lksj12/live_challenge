const addTodoButton = document.querySelector("#add-todo-button");
const todoList = document.querySelector("#todo-list");
const todoCount = document.querySelector("#todo-count");

let todos = JSON.parse(localStorage.getItem("todos")) || [];
let isAdding = false;
let editingId = null;

addTodoButton.addEventListener("click", function () {
  if (isAdding === true) {
    return;
  }

  isAdding = true;
  editingId = null;
  renderTodos();
});

function getPenIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20h4.5L19.7 8.8l-4.5-4.5L4 15.5V20z"
        fill="#d94f68"
      />
      <path
        d="M16.3 3.2l4.5 4.5 1.2-1.2c.8-.8.8-2 0-2.8l-1.7-1.7c-.8-.8-2-.8-2.8 0l-1.2 1.2z"
        fill="#38455a"
      />
      <path
        d="M4 20h4.5L4 15.5V20z"
        fill="#f3d38b"
      />
    </svg>
  `;
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function addTodo(text) {
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false
  };

  todos.unshift(newTodo);
  saveTodos();
  renderTodos();
}

function renderTodos() {
  todoList.innerHTML = "";

  if (isAdding === true) {
    renderInputBox();
  }

  todos.forEach(function (todo) {
    const todoItem = document.createElement("div");
    todoItem.className = "todo-item";

    if (todo.completed === true) {
      todoItem.classList.add("completed");
    }

    if (editingId === todo.id) {
      todoItem.innerHTML = `
        <input 
          class="todo-check" 
          type="checkbox"
          ${todo.completed ? "checked" : ""}
        />

        <input 
          class="edit-input" 
          type="text" 
          value="${todo.text}"
        />

        <div class="todo-actions">
          <button class="action-button edit-button" aria-label="수정 완료">
            ${getPenIcon()}
          </button>

          <button class="action-button delete-button">−</button>
        </div>
      `;

      const checkbox = todoItem.querySelector(".todo-check");
      const input = todoItem.querySelector(".edit-input");
      const saveButton = todoItem.querySelector(".edit-button");
      const deleteButton = todoItem.querySelector(".delete-button");

      checkbox.addEventListener("change", function () {
        toggleTodo(todo.id);
      });

      saveButton.addEventListener("click", function () {
        updateTodoText(todo.id, input.value);
      });

      input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          updateTodoText(todo.id, input.value);
        }
      });

      deleteButton.addEventListener("click", function () {
        deleteTodo(todo.id);
      });

      todoList.appendChild(todoItem);

      setTimeout(function () {
        input.focus();
        input.select();
      }, 0);

      return;
    }

    todoItem.innerHTML = `
      <input 
        class="todo-check" 
        type="checkbox"
        ${todo.completed ? "checked" : ""}
      />

      <span class="todo-text">${todo.text}</span>

      <div class="todo-actions">
        <button class="action-button edit-button" aria-label="수정">
          ${getPenIcon()}
        </button>

        <button class="action-button delete-button">−</button>
      </div>
    `;

    const checkbox = todoItem.querySelector(".todo-check");
    const editButton = todoItem.querySelector(".edit-button");
    const deleteButton = todoItem.querySelector(".delete-button");

    checkbox.addEventListener("change", function () {
      toggleTodo(todo.id);
    });

    editButton.addEventListener("click", function () {
      isAdding = false;
      editingId = todo.id;
      renderTodos();
    });

    deleteButton.addEventListener("click", function () {
      deleteTodo(todo.id);
    });

    todoList.appendChild(todoItem);
  });

  updateCount();
}

function renderInputBox() {
  const inputItem = document.createElement("div");
  inputItem.className = "todo-item";

  inputItem.innerHTML = `
    <input class="todo-check" type="checkbox" disabled />

    <input 
      class="edit-input" 
      type="text" 
      placeholder="할 일을 입력하세요"
    />

    <div class="todo-actions">
      <button class="action-button edit-button" aria-label="추가">
        ${getPenIcon()}
      </button>

      <button class="action-button delete-button">−</button>
    </div>
  `;

  const input = inputItem.querySelector(".edit-input");
  const saveButton = inputItem.querySelector(".edit-button");
  const cancelButton = inputItem.querySelector(".delete-button");

  saveButton.addEventListener("click", function () {
    saveInputTodo(input.value);
  });

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      saveInputTodo(input.value);
    }
  });

  cancelButton.addEventListener("click", function () {
    isAdding = false;
    renderTodos();
  });

  todoList.appendChild(inputItem);

  setTimeout(function () {
    input.focus();
  }, 0);
}

function saveInputTodo(text) {
  const trimmedText = text.trim();

  if (trimmedText === "") {
    alert("할 일을 입력해주세요.");
    return;
  }

  isAdding = false;
  addTodo(trimmedText);
}

function updateTodoText(id, text) {
  const trimmedText = text.trim();

  if (trimmedText === "") {
    alert("할 일을 입력해주세요.");
    return;
  }

  todos = todos.map(function (todo) {
    if (todo.id === id) {
      return {
        id: todo.id,
        text: trimmedText,
        completed: todo.completed
      };
    }

    return todo;
  });

  editingId = null;
  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  todos = todos.map(function (todo) {
    if (todo.id === id) {
      return {
        id: todo.id,
        text: todo.text,
        completed: !todo.completed
      };
    }

    return todo;
  });

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(function (todo) {
    return todo.id !== id;
  });

  if (editingId === id) {
    editingId = null;
  }

  saveTodos();
  renderTodos();
}

function updateCount() {
  const remainingCount = todos.filter(function (todo) {
    return todo.completed === false;
  }).length;

  todoCount.textContent = `남은 할 일: ${remainingCount}개`;
}

renderTodos();