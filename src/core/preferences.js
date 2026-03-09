import { CONFIG, deepClone } from './config.js';
import { sanitizePreferences } from './validate.js';

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge(baseValue, patchValue) {
  if (!isPlainObject(baseValue) || !isPlainObject(patchValue)) {
    return deepClone(patchValue);
  }

  const merged = deepClone(baseValue);
  for (const [key, value] of Object.entries(patchValue)) {
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      merged[key] = deepMerge(merged[key], value);
      continue;
    }
    merged[key] = deepClone(value);
  }

  return merged;
}

export let preferences = sanitizePreferences(CONFIG.defaults);

export const runtime = {
  settings: deepClone(preferences),
};

export function resolveRuntimeSettings() {
  runtime.settings = sanitizePreferences(preferences);
  return runtime.settings;
}

export function setPreferences(nextPreferences) {
  const sanitized = sanitizePreferences(nextPreferences);
  preferences = sanitized;
  runtime.settings = deepClone(sanitized);
  return runtime.settings;
}

export function patchPreferences(partialPreferences) {
  const merged = deepMerge(preferences, partialPreferences);
  return setPreferences(merged);
}

export function resetPreferences() {
  return setPreferences(CONFIG.defaults);
}
