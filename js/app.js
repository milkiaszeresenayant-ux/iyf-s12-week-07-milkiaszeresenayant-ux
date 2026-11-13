import {
    addTodo,
    clearCompleted,
    deleteTodo,
    editTodo,
    getState,
    setFilter,
    setTheme,
    subscribe,
    toggleTodo,
} from "./state.js";
import { renderApp, startEditing } from "./ui.js";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const filters = document.querySelector(".filters");
const clearCompletedButton = document.querySelector("#clear-completed");
const themeToggle = document.querySelector("#theme-toggle");

subscribe(renderApp);
renderApp(getState());

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!addTodo(input.value)) {
        input.setCustomValidity("Please enter a task.");
        input.reportValidity();
        input.setCustomValidity("");
        input.focus();
        return;
    }

    input.value = "";
    input.focus();
});

list.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || !event.target.matches(".todo-checkbox")) {
        return;
    }
    const item = event.target.closest("[data-todo-id]");
    if (item) {
        toggleTodo(item.dataset.todoId);
    }
});

list.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const deleteButton = event.target.closest('[data-action="delete"]');
    const item = deleteButton?.closest("[data-todo-id]");
    if (item) {
        deleteTodo(item.dataset.todoId);
    }
});

list.addEventListener("dblclick", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const text = event.target.closest(".todo-text");
    const item = text?.closest("[data-todo-id]");
    const todo = item ? getState().todos.find((task) => task.id === item.dataset.todoId) : null;
    if (item && todo) {
        startEditing(item, todo, editTodo, () => renderApp(getState()));
    }
});

filters.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const button = event.target.closest("[data-filter]");
    if (button) {
        setFilter(button.dataset.filter);
    }
});

clearCompletedButton.addEventListener("click", clearCompleted);

themeToggle.addEventListener("click", () => {
    setTheme(getState().theme === "dark" ? "light" : "dark");
});
