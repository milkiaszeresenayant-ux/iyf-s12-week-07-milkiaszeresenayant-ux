import { describe, expect, it } from "vitest";
import {
    addTodo,
    clearCompletedTodos,
    countTodos,
    deleteTodo,
    filterTodos,
    toggleTodo,
    updateTodoText,
} from "../js/todo-logic.js";

const sampleTodos = [
    { id: "1", text: "Read a chapter", completed: false },
    { id: "2", text: "Water the plants", completed: true },
];

describe("todo logic", () => {
    it("adds a trimmed task without changing the original list", () => {
        const originalTodos = structuredClone(sampleTodos);
        const updatedTodos = addTodo(sampleTodos, "  Plan the week  ", "3");

        expect(updatedTodos).toEqual([
            { id: "3", text: "Plan the week", completed: false },
            ...sampleTodos,
        ]);
        expect(sampleTodos).toEqual(originalTodos);
        expect(updatedTodos).not.toBe(sampleTodos);
    });

    it("rejects empty task text and does not change the list", () => {
        expect(addTodo(sampleTodos, "  ", "3")).toBe(sampleTodos);
    });

    it("toggles a matching task and leaves an unknown id unchanged", () => {
        const updatedTodos = toggleTodo(sampleTodos, "1");

        expect(updatedTodos[0].completed).toBe(true);
        expect(sampleTodos[0].completed).toBe(false);
        expect(toggleTodo(sampleTodos, "missing")).toBe(sampleTodos);
    });

    it("deletes only the matching task", () => {
        expect(deleteTodo(sampleTodos, "2")).toEqual([sampleTodos[0]]);
        expect(deleteTodo(sampleTodos, "missing")).toBe(sampleTodos);
    });

    it("filters active and completed tasks", () => {
        expect(filterTodos(sampleTodos, "active")).toEqual([sampleTodos[0]]);
        expect(filterTodos(sampleTodos, "completed")).toEqual([sampleTodos[1]]);
        expect(filterTodos(sampleTodos, "all")).toBe(sampleTodos);
    });

    it("returns zero counts for an empty list", () => {
        expect(countTodos([])).toEqual({ total: 0, active: 0, completed: 0 });
    });

    it("counts tasks by completion state", () => {
        expect(countTodos(sampleTodos)).toEqual({ total: 2, active: 1, completed: 1 });
    });

    it("updates trimmed task text and keeps empty edits unchanged", () => {
        expect(updateTodoText(sampleTodos, "1", "  Read two chapters  ")[0].text).toBe(
            "Read two chapters"
        );
        expect(updateTodoText(sampleTodos, "1", "  ")).toBe(sampleTodos);
    });

    it("clears completed tasks and preserves a list with nothing completed", () => {
        expect(clearCompletedTodos(sampleTodos)).toEqual([sampleTodos[0]]);
        expect(clearCompletedTodos([sampleTodos[0]])).toEqual([sampleTodos[0]]);
    });
});
