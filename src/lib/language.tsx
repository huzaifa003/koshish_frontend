"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { urdu } from "./urdu";
export type Language = "en" | "ur";
const Context = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (english: string, translation?: string) => string;
}>({ language: "en", setLanguage: () => {}, t: (english) => english });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setValue] = useState<Language>("en");
  useEffect(() => {
    try {
      if (localStorage.getItem("koshish-language") === "ur") setValue("ur");
    } catch {}
  }, []);
  const setLanguage = (value: Language) => {
    setValue(value);
    try {
      localStorage.setItem("koshish-language", value);
    } catch {}
  };
  const t = (english: string, translation?: string) =>
    language === "ur" ? (translation ?? urdu[english] ?? english) : english;
  return (
    <Context.Provider value={{ language, setLanguage, t }}>
      {children}
    </Context.Provider>
  );
}
export function useLanguage() {
  return useContext(Context);
}
