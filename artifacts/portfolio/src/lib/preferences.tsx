import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Message } from "./translations";

export type { Message } from "./translations";

export const languages = { en: "English", ko: "한국어", uz: "O‘zbekcha" } as const;
type Language = keyof typeof languages;
type Theme = "light" | "dark";

function readPreference(key: string) {
  try {
    return window.localStorage.getItem(`portfolio-${key}`);
  } catch {
    return null;
  }
}

function savePreference(key: string, value: string) {
  try {
    window.localStorage.setItem(`portfolio-${key}`, value);
  } catch {
    // The current selection still works when storage is unavailable.
  }
}

const Preferences = createContext<{
  language: Language;
  theme: Theme;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  t: (message: Message) => string;
} | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(() => {
    const saved = readPreference("language");
    return saved === "ko" || saved === "uz" ? saved : "en";
  });
  const [theme, updateTheme] = useState<Theme>(() =>
    readPreference("theme") === "dark" ? "dark" : "light",
  );

  function setLanguage(value: Language) {
    updateLanguage(value);
    savePreference("language", value);
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    updateTheme(next);
    savePreference("theme", next);
  }

  return (
    <Preferences.Provider value={{
      language,
      theme,
      setLanguage,
      toggleTheme,
      t: (message) => language === "en" ? message : translations[message][language],
    }}>
      {children}
    </Preferences.Provider>
  );
}

export function usePreferences() {
  const preferences = useContext(Preferences);
  if (!preferences) throw new Error("Missing PreferencesProvider");
  return preferences;
}
