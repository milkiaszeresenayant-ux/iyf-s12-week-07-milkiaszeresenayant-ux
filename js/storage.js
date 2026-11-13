const APP_STORAGE_KEY = "daylight.app.v2";
const LEGACY_TODOS_KEY = "daylight.todos.v1";
const LEGACY_THEME_KEY = "daylight.theme.v1";
const DEFAULT_STATE = { todos: [], filter: "all", theme: "light" };
const VALID_FILTERS = ["all", "active", "completed"];

function isValidTodo(todo) {
    return (
        todo !== null &&
        typeof todo === "object" &&
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean"
    );
}

function cleanTodos(todos) {
    if (!Array.isArray(todos)) {
        return null;
    }

    return todos
        .filter(isValidTodo)
        .map((todo) => ({
            id: todo.id,
            text: todo.text.trim().slice(0, 160),
            completed: todo.completed,
        }))
        .filter((todo) => todo.id.length > 0 && todo.text.length > 0);
}

function parseJson(serializedValue, fallback) {
    if (serializedValue === null) {
        return { value: fallback, warning: "" };
    }

    try {
        return { value: JSON.parse(serializedValue), warning: "" };
    } catch (error) {
        console.error("Could not parse saved Daylight data:", error);
        return {
            value: fallback,
            warning: "Saved data was invalid, so a fresh list has been loaded.",
        };
    }
}

export function loadAppState() {
    try {
        const savedState = parseJson(window.localStorage.getItem(APP_STORAGE_KEY), null);
        if (savedState.warning) {
            return { state: DEFAULT_STATE, warning: savedState.warning };
        }

        if (savedState.value === null) {
            const legacyTodos = parseJson(window.localStorage.getItem(LEGACY_TODOS_KEY), []);
            const todos = cleanTodos(legacyTodos.value);
            const savedTheme = window.localStorage.getItem(LEGACY_THEME_KEY);

            if (legacyTodos.warning || todos === null) {
                return {
                    state: DEFAULT_STATE,
                    warning: legacyTodos.warning || "Older saved tasks were not a valid list.",
                };
            }

            return {
                state: {
                    ...DEFAULT_STATE,
                    todos,
                    theme: savedTheme === "dark" ? "dark" : "light",
                },
                warning:
                    todos.length < legacyTodos.value.length
                        ? "Some older saved tasks were invalid and were skipped."
                        : "",
            };
        }

        if (savedState.value === null || typeof savedState.value !== "object") {
            return { state: DEFAULT_STATE, warning: "Saved data had an unsupported format." };
        }

        const todos = cleanTodos(savedState.value.todos);
        if (todos === null) {
            return { state: DEFAULT_STATE, warning: "Saved tasks were not a valid list." };
        }

        const validFilter = VALID_FILTERS.includes(savedState.value.filter);
        const validTheme = savedState.value.theme === "light" || savedState.value.theme === "dark";
        const warning =
            todos.length < savedState.value.todos.length
                ? "Some saved tasks were invalid and were skipped."
                : !validFilter || !validTheme
                  ? "Some saved preferences were invalid and were reset."
                  : "";

        return {
            state: {
                todos,
                filter: validFilter ? savedState.value.filter : "all",
                theme: savedState.value.theme === "dark" ? "dark" : "light",
            },
            warning,
        };
    } catch (error) {
        console.error("Could not access saved Daylight data:", error);
        return {
            state: DEFAULT_STATE,
            warning: "Browser storage is unavailable. Changes may not persist.",
        };
    }
}

export function saveAppState(state) {
    try {
        window.localStorage.setItem(
            APP_STORAGE_KEY,
            JSON.stringify({
                todos: state.todos,
                filter: state.filter,
                theme: state.theme,
            })
        );
        return "";
    } catch (error) {
        console.error("Could not save Daylight data:", error);
        return "Browser storage is unavailable. Changes may not persist.";
    }
}
