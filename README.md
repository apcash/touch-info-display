# Full Touch Info Display

A first React project: a calm, touch-friendly home information dashboard built with JavaScript, React, and plain CSS. Vite runs the development server and creates production files.

## Start here

Install Node.js 22.12+ (Node 24 also works), open this folder in your editor, then run:

```sh
npm install
npm run dev
```

Open the local address printed in the terminal. For a production check, run `npm run build`, then `npm run preview`.

## MVP and assumptions

The recovered conversation establishes that you finished the React section of Angela Yu's course and want to begin the project. It contains no detailed hardware or integration plan. This first version assumes a landscape touch display, with responsive layouts for narrower screens.

- Live device-local clock and date.
- Checklist with add, complete, and delete actions, persisted in this browser.
- Saved Fahrenheit/Celsius, 12/24-hour, and light/dark settings.
- Clearly labeled sample weather and Bambu printer information.
- Large touch controls, native form elements, keyboard focus indicators, and responsive CSS.

Weather and printer data are fictional demonstrations. No live services, printer commands, account sync, calendar integration, or kiosk setup are included. Clearing browser data clears tasks and settings. Fonts use Google Fonts with local sans-serif fallbacks.

## Architecture before integrations

```text
main.jsx                  Mounts React and loads CSS
App.jsx                   Shared settings and page layout
  Clock.jsx               Local time and timer lifecycle
  WeatherCard.jsx         Renders weather props and converts units
  PrinterCard.jsx         Renders printer props
  Checklist.jsx           Task state, input, and local persistence
demoData.js               Sample information, separate from presentation
storage.js                Safe local storage reads/writes
styles.css                Grid, cards, themes, and screen-size rules
```

We use ordinary functions and props, with no router or global state library because this is one screen with a small component tree. `App` owns shared settings and passes them down. The checklist owns its independent state. Each component has one clear job.

## Learn by following a click

1. Open `Checklist.jsx`. Typing calls `setDraft`, and React updates the controlled input's `value`.
2. Submitting the form calls `addTask`. Spread syntax makes a new array instead of mutating existing state.
3. `.map()` renders one row per task. The stable task ID is React's `key`, so deleting an item doesn't confuse the other rows.
4. Checking a task calls `toggleTask`. Another `.map()` replaces only the matching task with a new object.
5. An effect saves the updated array to local storage. This is an external browser system, so it belongs in an effect.

Next, inspect `App.jsx`: settings live here because both the clock and weather card need them. Props flow down; event handlers request state changes. `Clock.jsx` uses an effect for its interval, and returns a cleanup function so the interval stops when the component unmounts. `StrictMode` helps expose missing cleanup during development.

Try these small exercises in order:

1. Change a card heading in JSX and its spacing in CSS.
2. Add a new sample task to `initialTasks` (existing saved tasks take precedence).
3. Add a button that removes completed tasks using `.filter()`.
4. Add a weather detail to `demoData.js` and render it through props.

## Next milestones

1. Confirm display resolution, device/OS, location, and priority cards.
2. Connect weather: introduce a small fetching module, loading/error states, a last-updated timestamp, and stale-data handling. Keep the weather card focused on presentation.
3. Confirm the Bambu model and available connection method. Put credentials and any printer connection in a small server-side service; never include secrets in client code or Vite-exposed environment variables. Start read-only and surface disconnected/stale states.
4. Test on the actual touchscreen before adding kiosk startup, sleep schedules, or more integrations.

## Manual acceptance checks

- Add a task, complete it, reload, and confirm it remains completed; then delete it.
- Change units and confirm all weather temperatures change together.
- Switch theme and clock format; reload and confirm settings persist.
- Check a narrow window for scrolling/overflow and use Tab/Space/Enter on controls.
- Confirm all weather/printer data stays labeled as sample information.

## References

- [React: Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [React: useEffect and cleanup](https://react.dev/reference/react/useEffect)
- [Vite: Getting started](https://vite.dev/guide/)
