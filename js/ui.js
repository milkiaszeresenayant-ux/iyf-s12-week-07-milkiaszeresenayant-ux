import { countTodos, filterTodos } from "./todo-logic.js";

const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const emptyTitle = document.querySelector("#empty-title");
const emptyCopy = document.querySelector("#empty-copy");
const itemsLeft = document.querySelector("#items-left");
const allCount = document.querySelector("#all-count");
const activeCount = document.querySelector("#active-count");
const completedCount = document.querySelector("#completed-count");
const filters = document.querySelector(".filters");
const clearCompletedButton = document.querySelector("#clear-completed");
const storageStatus = document.querySelector("#storage-status");
const themeToggle = document.querySelector("#theme-toggle");

function createTodoElement(todo) {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " is-complete" : ""}`;
    item.dataset.todoId = todo.id;

    const checkbox = document.createElement("input");
    checkbox.className = "todo-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute(
        "aria-label",
        `Mark "${todo.text}" ${todo.completed ? "as active" : "as complete"}`
    );

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;
    text.title = "Double-click to edit";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.dataset.action = "delete";
    deleteButton.setAttribute("aria-label", `Delete "${todo.text}"`);
    deleteButton.textContent = "×";

    item.append(checkbox, text, deleteButton);
    return item;
}

function renderTodos(todos, filter) {
    const visibleTodos = filterTodos(todos, filter);
    const fragment = document.createDocumentFragment();

    visibleTodos.forEach((todo) => fragment.append(createTodoElement(todo)));
    list.replaceChildren(fragment);

    const counts = countTodos(todos);
    itemsLeft.textContent = `${counts.active} ${counts.active === 1 ? "item" : "items"} left`;
    allCount.textContent = String(counts.total);
    activeCount.textContent = String(counts.active);
    completedCount.textContent = String(counts.completed);
    clearCompletedButton.disabled = counts.completed === 0;
    emptyState.hidden = visibleTodos.length > 0;

    if (counts.total === 0) {
        emptyTitle.textContent = "A fresh start";
        emptyCopy.textContent = "Add a task above and take it one step at a time.";
    } else if (filter === "active") {
        emptyTitle.textContent = "All caught up";
        emptyCopy.textContent = "There are no active tasks. Enjoy the breathing room.";
    } else {
        emptyTitle.textContent = "Nothing completed yet";
        emptyCopy.textContent = "Finish a task and it will find a home here.";
    }

    filters.querySelectorAll("[data-filter]").forEach((button) => {
        const isActive = button.dataset.filter === filter;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

export function renderApp(state) {
    document.documentElement.dataset.theme = state.theme;
    const isDark = state.theme === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
    renderTodos(state.todos, state.filter);
    storageStatus.textContent = state.storageWarning || "Saved on this device.";
    storageStatus.dataset.state = state.storageWarning ? "error" : "info";
}

export function startEditing(item, todo, onSave, onCancel) {
    const text = item.querySelector(".todo-text");
    if (!text || item.querySelector(".edit-input")) {
        return;
    }

    const editor = document.createElement("input");
    editor.className = "edit-input";
    editor.type = "text";
    editor.maxLength = 160;
    editor.value = todo.text;
    editor.setAttribute("aria-label", `Edit task: ${todo.text}`);
    text.replaceWith(editor);
    editor.focus();
    editor.select();

    let finished = false;
    function finishEditing(shouldSave) {
        if (finished) {
            return;
        }
        finished = true;
        const nextText = editor.value.trim();
        if (shouldSave && nextText && nextText !== todo.text) {
            onSave(todo.id, nextText);
        } else {
            onCancel();
        }
    }

    editor.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            finishEditing(true);
        } else if (event.key === "Escape") {
            finishEditing(false);
        }
    });
    editor.addEventListener("blur", () => finishEditing(true));
}
