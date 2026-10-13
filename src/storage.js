// Storage may be unavailable in private/kiosk browsers. The UI still works.
export function readSaved(key, fallback, isValid) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
