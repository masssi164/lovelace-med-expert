import * as en from './languages/en.json';
import * as de from './languages/de.json';
import * as nb from './languages/nb.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
  en: en,
  de: de,
  nb: nb,
};

/**
 * Localize a string key with optional placeholder replacement.
 *
 * @param key - The dot-notation key (e.g., 'card.title')
 * @param search - Optional placeholder to search for (e.g., '{count}')
 * @param replace - Optional value to replace the placeholder with
 * @returns The localized string, or the key if not found
 */
export function localize(key: string, search = '', replace = ''): string {
  // Get language from HA localStorage, falling back to 'en'
  const lang = (localStorage.getItem('selectedLanguage') || 'en')
    .replace(/['"]+/g, '')
    .replace('-', '_')
    .split('_')[0]; // Handle regional variants like 'de-DE' -> 'de'

  let translated: string;

  try {
    translated = key.split('.').reduce((o, i) => o[i], languages[lang]);
  } catch (e) {
    // Fall back to English
    translated = key.split('.').reduce((o, i) => o[i], languages['en']);
  }

  // Final fallback to English if undefined
  if (translated === undefined) {
    try {
      translated = key.split('.').reduce((o, i) => o[i], languages['en']);
    } catch (e) {
      translated = key; // Return the key itself if nothing found
    }
  }

  // Replace placeholder if provided
  if (search !== '' && replace !== '') {
    translated = translated.replace(search, replace);
  }

  return translated;
}
