import en from "./json/en.json" with { type: "json" };
import zhCN from "./json/zhCN.json" with { type: "json" };

// Merged into the dashboard's existing translation namespaces, so our custom
// admin pages follow the language selected in Settings → Profile → Language.
export default {
  en: { translation: en },
  zhCN: { translation: zhCN },
};
