const VALID_FILTERS = new Set(["all", "active", "completed"]);

export function addTodo(todos, text, id) {
    const cleanText = typeof text === "string" ? text.trim().slice(0, 160) : "";
    if (!cleanText || typeof id !== "string" || !id.trim()) {
        return todos;
    }

    return [{ id, text: cleanText, completed: false }, ...todos];
}

export function toggleTodo(todos, id) {
    if (!todos.some((todo) => todo.id === id)) {
        return todos;
    }

    return todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
}

export function deleteTodo(todos, id) {
    if (!todos.some((todo) => todo.id === id)) {
        return todos;
    }

    return todos.filter((todo) => todo.id !== id);
}

export function updateTodoText(todos, id, text) {
    const cleanText = typeof text === "string" ? text.trim().slice(0, 160) : "";
    if (!cleanText || !todos.some((todo) => todo.id === id)) {
        return todos;
    }

    return todos.map((todo) => (todo.id === id ? { ...todo, text: cleanText } : todo));
}

export function filterTodos(todos, filter) {
    if (!VALID_FILTERS.has(filter)) {
        return todos;
    }

    if (filter === "active") {
        return todos.filter((todo) => !todo.completed);
    }
    if (filter === "completed") {
        return todos.filter((todo) => todo.completed);
    }
    return todos;
}

export function clearCompletedTodos(todos) {
    if (!todos.some((todo) => todo.completed)) {
        return todos;
    }

    return todos.filter((todo) => !todo.completed);
}

export function countTodos(todos) {
    const completed = todos.filter((todo) => todo.completed).length;
    return {
        total: todos.length,
        active: todos.length - completed,
        completed,
    };
}
