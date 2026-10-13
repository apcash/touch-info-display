import React, { useEffect, useState } from "react";
import { readSaved, save } from "../storage";
const initialTasks = [
  { id: "first", text: "Explore your new display", done: false },
  { id: "second", text: "Choose your first integration", done: false },
];
const validTasks = (value) =>
  Array.isArray(value) &&
  value.every(
    (t) =>
      t &&
      typeof t.id === "string" &&
      typeof t.text === "string" &&
      typeof t.done === "boolean",
  );
export default function Checklist() {
  const [tasks, setTasks] = useState(() =>
    readSaved("touch-display.tasks", initialTasks, validTasks),
  );
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    setSaved(save("touch-display.tasks", tasks));
  }, [tasks]);
  function addTask(event) {
    event.preventDefault();
    if (!draft.trim()) return;
    setTasks((previous) => [
      ...previous,
      { id: crypto.randomUUID(), text: draft.trim(), done: false },
    ]);
    setDraft("");
  }
  // Create a new array rather than changing existing state in place.
  function toggleTask(id) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task,
      ),
    );
  }
  const completed = tasks.filter((task) => task.done).length;
  return (
    <section className="card checklist" aria-labelledby="checklist-title">
      <div className="card-heading">
        <h2 id="checklist-title">A little focus</h2>
        <span className="task-count">
          {completed}/{tasks.length} done
        </span>
      </div>
      <p className="muted">Make room for what matters today.</p>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <label className={task.done ? "done" : ""}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span>{task.text}</span>
            </label>
            <button
              className="remove"
              aria-label={`Delete ${task.text}`}
              onClick={() =>
                setTasks((previous) => previous.filter((t) => t.id !== task.id))
              }
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {tasks.length === 0 && (
        <p className="empty">A clear slate. Add something below.</p>
      )}
      <form onSubmit={addTask}>
        <label className="sr-only" htmlFor="new-task">
          New task
        </label>
        <input
          id="new-task"
          maxLength={120}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add something to do…"
        />
        <button className="add" disabled={!draft.trim()} type="submit">
          Add
        </button>
      </form>
      <p className="storage-note" role="status">
        {saved
          ? "Saved on this device"
          : "Storage unavailable. Changes last until you close or reload."}
      </p>
    </section>
  );
}
