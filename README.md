# Week 7 — JavaScript Best Practices

This project refactors the Week 5 Daylight to-do list into small JavaScript modules. Tasks, filters, and the theme persist in browser storage; pure task transformations are tested with Vitest.

## Author

- **Name:** Milkias Zeresenayant
- **GitHub:** [@milkiaszeresenayant-ux](https://github.com/milkiaszeresenayant-ux)
- **Date:** November 13, 2026
- **Suggested repository name:** `iyf-s12-week-07-milkiaszeresenayant-ux`

## Project description

Daylight is a responsive to-do list that demonstrates maintainable vanilla JavaScript: UI, state, persistence, and pure business logic are separated so the task rules can be tested independently.

## Technologies used

- HTML5 and CSS3
- Vanilla JavaScript with native ES modules and browser APIs
- Node.js 24, npm, ESLint, Prettier, and Vitest

## Features

- Add, edit, complete, filter, and delete tasks; clear completed tasks.
- Restore the Week 5 `daylight.todos.v1` and `daylight.theme.v1` data on first launch, then save the complete app state.
- Keep pure array transformations in `js/todo-logic.js`, storage in `js/storage.js`, state and subscriptions in `js/state.js`, and DOM rendering in `js/ui.js`.
- Show a visible warning if browser storage is unavailable or saved data cannot be read.
- Run ESLint, Prettier, and Vitest checks.
- Use the `cart/` shopping-cart class build, including quantity changes, persistence, clear, and undo.
- Try Day 1 theme persistence, Day 2 recent searches, Day 3 form auto-save, and a tab-scoped `sessionStorage` draft in `daily-challenges/`.
- Review the Weather Dashboard and find the review notes below.

## Run locally

Use Node.js 22 or 24. From this folder, install dependencies and run the checks:

```powershell
npm install
npm test
npm run lint
npm run format:check
```

Start a local static server so browser modules work. For example, with Python:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000` and use the navigation to visit the shopping cart and daily challenges. Stop the server with `Ctrl+C`.

## Project layout

```text
index.html
styles.css
js/
  app.js
  state.js
  storage.js
  todo-logic.js
  ui.js
tests/
  todo-logic.test.js
cart/
  index.html
  cart.js
  cart.css
daily-challenges/
  index.html
  challenges.js
  challenges.css
eslint.config.js
.prettierrc
package.json
package-lock.json
.gitignore
```

`node_modules/` is excluded by `.gitignore`; commit `package-lock.json` so the installed tool versions can be reproduced.

## Lessons learned

- Pure functions make state changes predictable and let tests run without a browser.
- A single in-memory state and a save-after-change flow avoid drift between the UI and local storage.
- Small modules clarify ownership: data transformations, storage, state transitions, and rendering have separate responsibilities.
- Browser storage is fallible; parsing, validation, and user-visible error messages are part of reliable persistence.

## Challenges faced

- Migrating saved Week 5 tasks required accepting the old storage keys while validating and writing the new app state shape.
- Separating logic from DOM code meant replacing direct mutations with new arrays and re-rendering from state after each action.
- Tests use the Node environment, so keeping browser APIs out of `todo-logic.js` was essential.

## Storage and state notes

- `localStorage` is used for the to-do list, theme preference, shopping cart, recent searches, and the auto-saved challenge form. These should remain after the browser is closed.
- `sessionStorage` is appropriate for temporary, tab-scoped form drafts. It is cleared when that tab's browsing session ends. The Week 7 daily form uses `localStorage` to meet the challenge requirement to recover its draft after a page refresh.
- JSON parsing and storage access are guarded. Invalid saved records are discarded; storage problems are reported in the interface instead of stopping the app.
- The task logic receives data and returns new arrays. It never reads the DOM or browser storage, so its behavior can be tested in Node.

## Debugging exercise

The Lesson 14.3 sample `calculateOrderTotal` has two bugs: the loop uses `i <= items.length`, which reads one item past the end, and `item.quanity` is misspelled. Use `i < items.length` and `item.quantity`. The sample order totals 69, so the 10% discount does not apply; an order over 100 receives the discount.

## Weather Dashboard review (Day 5)

Reviewed the existing `WEATHER-DASHBOARD` project's `app.js`, `config.js`, and `index.html`. No files in that project were modified.

**What is working well**

- `fetchWeather` checks `response.ok` and gives useful messages for common HTTP errors.
- Loading state cleanup is in `finally`, and requests are awaited inside `try`/`catch`.
- Recent searches are de-duplicated case-insensitively, limited to five, rendered with `textContent`, and use event delegation.
- The API key is kept out of `app.js`; the documentation correctly warns that browser-side keys are still visible to visitors.

**Improvements to consider**

1. **High — protect the API key and configure deployments.** `config.js` is empty in the checked project. A working browser app needs a key, but any key shipped to a public page can be extracted from the browser even if GitHub Actions generated that file. Keep the key out of source control, restrict its provider usage, and use a server-side proxy if it must remain secret.
2. **Medium — prevent stale responses from replacing newer results.** Two quick searches can finish out of order, allowing an older result to overwrite the latest one. Use an `AbortController` or request sequence identifier and ignore outdated responses.
3. **Low — distinguish network errors from invalid response data.** The catch block labels every `TypeError` a network error, including failures caused by an unexpected API response shape. Validate the response before rendering and show an accurate fallback message.
4. **Low — surface history read failures in the interface.** `loadRecent` logs a warning and continues with an empty list. A small status message would tell the user why previous searches disappeared when storage is blocked or malformed.

## Collaboration requirement

The course's peer-review task requires a real classmate, a review-board claim, inline GitHub comments, and a response to feedback on a PR. Those actions cannot be honestly completed from this local folder without the class review board, a pushed repository, and a reviewer. No PR or peer review is claimed here. Complete and link these items before submitting:

- **Team / partner:** Not arranged yet; find a reviewer on the Classroom Week 7 Review Board.
- **PR I opened:** Not opened yet; create the module-refactor PR in the Week 7 repository.
- **PR I reviewed:** Not reviewed yet; claim the oldest unreviewed PR on the board and leave inline comments.
- **Review I wrote:** Add a link to one of your inline comments after the review is submitted.

## Course source

Built to the Week 7 task specification in the [IYF Weekend Academy Season 12 curriculum](https://github.com/Chacha-A-Chacha/IYF-weekend_academy/tree/main/season-12/tasks/week-07-js-best-practices).
