import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const ko = {
  app: { title: "근무 관리" },
  auth: {
    login: "로그인",
    signup: "회원가입",
    email: "이메일",
    password: "비밀번호",
    name: "이름",
    submit: "확인",
    no_account: "계정이 없나요?",
    have_account: "이미 계정이 있나요?",
    invalid: "이메일 또는 비밀번호가 올바르지 않습니다.",
  },
};

const en = {
  app: { title: "Work Manager" },
  auth: {
    login: "Log in",
    signup: "Sign up",
    email: "Email",
    password: "Password",
    name: "Name",
    submit: "Submit",
    no_account: "No account?",
    have_account: "Have an account?",
    invalid: "Invalid email or password.",
  },
};

i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: navigator.language.startsWith("en") ? "en" : "ko",
  fallbackLng: "ko",
  interpolation: { escapeValue: false },
});

export default i18n;
