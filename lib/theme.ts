const THEME_CHOICES = ["light", "dark", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];

export const THEME_STORAGE_KEY = "dugout-theme";

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return (
    typeof value === "string" &&
    (THEME_CHOICES as readonly string[]).includes(value)
  );
}

/**
 * Applies a stored theme before first paint.
 *
 * Inlined into <head> as a blocking script — anything React does runs after
 * the browser has painted, and that paint is the white flash this exists to
 * avoid.
 *
 * It defers to an attribute already on the element: when signed in, the server
 * renders the preference from the account, and that is authoritative. A stale
 * value in another browser's localStorage must not override it. Signed out,
 * there is no server value and localStorage is all there is.
 */
export const themeInitScript = `
(function(){
  try {
    if (document.documentElement.hasAttribute('data-theme')) return;
    var c = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (c === 'light' || c === 'dark') {
      document.documentElement.setAttribute('data-theme', c);
    }
  } catch (e) {}
})();
`;
