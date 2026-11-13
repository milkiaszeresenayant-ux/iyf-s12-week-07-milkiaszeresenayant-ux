import { getState, setTheme, subscribe } from "../js/state.js";

const RECENT_SEARCHES_KEY = "daylight.recent-searches.v1";
const DRAFT_KEY = "daylight.contact-draft.v1";
const MAX_RECENT_SEARCHES = 5;
const AUTOSAVE_INTERVAL_MS = 5_000;
const themeToggle = document.querySelector("#theme-toggle");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchSuggestions = document.querySelector("#search-suggestions");
const searchStatus = document.querySelector("#search-status");
const draftForm = document.querySelector("#draft-form");
const draftStatus = document.querySelector("#draft-status");
const sessionForm = document.querySelector("#session-form");
const sessionNote = document.querySelector("#session-note");
const sessionStatus = document.querySelector("#session-status");
let recentSearches = [];

function showStatus(element, message, isError = false) {
    element.textContent = message;
    element.dataset.state = isError ? "error" : "info";
}

function renderTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} theme`);
}

function loadRecentSearches() {
    try {
        const savedSearches = window.localStorage.getItem(RECENT_SEARCHES_KEY);
        if (savedSearches === null) {
            return [];
        }

        const parsedSearches = JSON.parse(savedSearches);
        if (!Array.isArray(parsedSearches)) {
            throw new TypeError("Saved recent searches are not a list.");
        }

        const validSearches = parsedSearches.filter(
            (search) => typeof search === "string" && search.trim()
        );
        if (validSearches.length < parsedSearches.length) {
            showStatus(searchStatus, "Invalid saved searches were skipped.", true);
        }
        return validSearches.slice(0, MAX_RECENT_SEARCHES);
    } catch (error) {
        console.error("Could not load recent searches:", error);
        showStatus(searchStatus, "Recent searches could not be loaded from browser storage.", true);
        return [];
    }
}

function saveRecentSearch(search) {
    recentSearches = [
        search,
        ...recentSearches.filter(
            (previousSearch) => previousSearch.toLowerCase() !== search.toLowerCase()
        ),
    ].slice(0, MAX_RECENT_SEARCHES);

    try {
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
        showStatus(searchStatus, `Searching for “${search}”.`);
    } catch (error) {
        console.error("Could not save recent searches:", error);
        showStatus(
            searchStatus,
            "Search worked, but browser storage could not save its history.",
            true
        );
    }
    renderRecentSearches();
}

function renderRecentSearches() {
    const fragment = document.createDocumentFragment();
    recentSearches.forEach((search) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "suggestion-button";
        button.textContent = search;
        item.append(button);
        fragment.append(item);
    });
    searchSuggestions.replaceChildren(fragment);
}

function restoreDraft() {
    try {
        const savedDraft = window.localStorage.getItem(DRAFT_KEY);
        if (savedDraft === null) {
            return;
        }
        const draft = JSON.parse(savedDraft);
        if (!draft || typeof draft !== "object") {
            throw new TypeError("Saved form data is not an object.");
        }

        for (const field of draftForm.elements) {
            if (field.name && typeof draft[field.name] === "string") {
                field.value = draft[field.name];
            }
        }
        showStatus(draftStatus, "Draft restored from this device.");
    } catch (error) {
        console.error("Could not restore the saved draft:", error);
        showStatus(draftStatus, "Saved draft could not be restored.", true);
    }
}

function saveDraft() {
    const draft = Object.fromEntries(new FormData(draftForm).entries());
    try {
        const hasContent = Object.values(draft).some((value) => value.trim());
        if (!hasContent) {
            window.localStorage.removeItem(DRAFT_KEY);
            return;
        }

        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        showStatus(draftStatus, "Draft saved on this device.");
    } catch (error) {
        console.error("Could not save the draft:", error);
        showStatus(draftStatus, "Browser storage could not save this draft.", true);
    }
}

function clearDraft() {
    try {
        window.localStorage.removeItem(DRAFT_KEY);
        draftForm.reset();
        showStatus(draftStatus, "Submitted. Saved draft cleared.");
    } catch (error) {
        console.error("Could not clear the saved draft:", error);
        showStatus(draftStatus, "Submitted, but the saved draft could not be cleared.", true);
    }
}

function restoreSessionDraft() {
    try {
        sessionNote.value = window.sessionStorage.getItem("daylight.session-note.v1") || "";
    } catch (error) {
        console.error("Could not restore the tab-only draft:", error);
        showStatus(sessionStatus, "Tab storage is unavailable for this note.", true);
    }
}

subscribe((state) => renderTheme(state.theme));
renderTheme(getState().theme);
recentSearches = loadRecentSearches();
renderRecentSearches();
restoreDraft();
restoreSessionDraft();
window.setInterval(saveDraft, AUTOSAVE_INTERVAL_MS);

themeToggle.addEventListener("click", () => {
    setTheme(getState().theme === "dark" ? "light" : "dark");
});

searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const search = searchInput.value.trim();
    if (search) {
        saveRecentSearch(search);
    }
});

searchSuggestions.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }
    const suggestion = event.target.closest(".suggestion-button");
    if (suggestion) {
        searchInput.value = suggestion.textContent;
        searchForm.requestSubmit();
    }
});

draftForm.addEventListener("submit", (event) => {
    event.preventDefault();
    clearDraft();
});

sessionNote.addEventListener("input", () => {
    try {
        window.sessionStorage.setItem("daylight.session-note.v1", sessionNote.value);
        showStatus(sessionStatus, "Note saved for this tab.");
    } catch (error) {
        console.error("Could not save the tab-only draft:", error);
        showStatus(sessionStatus, "Tab storage could not save this note.", true);
    }
});

sessionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
        window.sessionStorage.removeItem("daylight.session-note.v1");
        sessionForm.reset();
        showStatus(sessionStatus, "Tab-only note cleared.");
    } catch (error) {
        console.error("Could not clear the tab-only draft:", error);
        showStatus(sessionStatus, "Tab storage could not clear this note.", true);
    }
});
