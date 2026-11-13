import {
    addTodo as addTodoToList,
    clearCompletedTodos,
    deleteTodo as deleteTodoFromList,
    toggleTodo as toggleTodoInList,
    updateTodoText,
} from "./todo-logic.js";
import { loadAppState, saveAppState } from "./storage.js";

const VALID_FILTERS = new Set(["all", "active", "completed"]);
const loadedState = loadAppState();
let currentState = { ...loadedState.state, storageWarning: loadedState.warning };
const subscribers = new Set();

function notifySubscribers() {
    subscribers.forEach((subscriber) => subscriber(currentState));
}

function commit(updates) {
    const nextState = { ...currentState, ...updates };
    const storageWarning = saveAppState(nextState);
    currentState = { ...nextState, storageWarning };
    notifySubscribers();
}

function createTodoId() {
    if (typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getState() {
    return currentState;
}

export function subscribe(subscriber) {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
}

export function addTodo(text) {
    const todos = addTodoToList(currentState.todos, text, createTodoId());
    if (todos === currentState.todos) {
        return false;
    }

    commit({ todos, filter: currentState.filter === "completed" ? "all" : currentState.filter });
    return true;
}

export function toggleTodo(id) {
    const todos = toggleTodoInList(currentState.todos, id);
    if (todos !== currentState.todos) {
        commit({ todos });
    }
}

export function deleteTodo(id) {
    const todos = deleteTodoFromList(currentState.todos, id);
    if (todos !== currentState.todos) {
        commit({ todos });
    }
}

export function editTodo(id, text) {
    const todos = updateTodoText(currentState.todos, id, text);
    if (todos !== currentState.todos) {
        commit({ todos });
    }
}

export function setFilter(filter) {
    if (VALID_FILTERS.has(filter) && filter !== currentState.filter) {
        commit({ filter });
    }
}

export function clearCompleted() {
    const todos = clearCompletedTodos(currentState.todos);
    if (todos !== currentState.todos) {
        commit({ todos });
    }
}

export function setTheme(theme) {
    if ((theme === "light" || theme === "dark") && theme !== currentState.theme) {
        commit({ theme });
    }
}
