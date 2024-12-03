class I18n {
  constructor() {
    this.currentLang = localStorage.getItem("language") || "zh-CN";
    this.translations = {};
    document.documentElement.lang = this.currentLang;
    document.documentElement.setAttribute('data-lang', this.currentLang);
  }

  async init() {
    // 加载语言文件
    try {
      const response = await fetch(`/i18n/${this.currentLang}.json`);
      this.translations = await response.json();
      this.updateLanguage();
    } catch (error) {
      console.error("Failed to load language file:", error);
    }
  }

  async switchLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    await this.init();
    this.updateCSSVariables();
  }

  updateCSSVariables() {
    // 更新 CSS 变量
    const recommendedText = this.getTranslation('price.recommended');
    document.documentElement.style.setProperty('--price-recommended-text', `"${recommendedText}"`);
  }

  updateLanguage() {
    // 更新普通文本内容
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.getTranslation(key);
      if (translation) {
        if (element.tagName === 'META') {
          element.content = translation;
        } else {
          element.textContent = translation;
        }
      }
    });

    // 更新 placeholder 属性
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.getTranslation(key);
      if (translation) {
        element.placeholder = translation;
      }
    });

    // 更新 title 属性
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.getTranslation(key);
      if (translation) {
        element.title = translation;
      }
    });

    // 更新 alt 属性
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
      const key = element.getAttribute('data-i18n-alt');
      const translation = this.getTranslation(key);
      if (translation) {
        element.alt = translation;
      }
    });
  }

  getTranslation(key) {
    return key.split(".").reduce((obj, i) => obj?.[i], this.translations);
  }
}
