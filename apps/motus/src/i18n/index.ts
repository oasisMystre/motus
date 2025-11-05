import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// @ts-expect-error
import LanguageDetector from "i18next-react-native-language-detector";

import { resources } from "./resources";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    compatibilityJSON: "v4",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
