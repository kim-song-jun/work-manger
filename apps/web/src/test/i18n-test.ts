/**
 * Test util: minimal i18next init for components that consume `useTranslation`.
 * Returns the translation key as the value so tests can assert on stable strings
 * without depending on the actual translation bundle.
 *
 * Why: TabBar / LoginForm / etc. call `useTranslation`. Without i18n init the
 * `t()` call returns the key, but missing-init warnings spam test output and
 * react-i18next throws on `t()` if not initialized in some setups.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: "ko",
    fallbackLng: "ko",
    resources: { ko: { translation: {} } },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });
}

export default i18n;
