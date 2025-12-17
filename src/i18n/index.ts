/**
 * 国际化配置
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zhCN from './zh-CN.json';
import enUS from './en-US.json';

// 初始化 i18n
i18n.use(initReactI18next).init({
  resources: {
    'zh-CN': {
      translation: zhCN
    },
    'en-US': {
      translation: enUS
    }
  },
  lng: 'zh-CN', // 默认语言
  fallbackLng: 'zh-CN',
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
