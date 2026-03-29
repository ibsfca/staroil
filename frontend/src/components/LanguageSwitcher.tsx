import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="flex items-center space-x-2">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-3 py-2 rounded-lg font-medium transition-all ${
            i18n.language === lang.code
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={lang.label}
        >
          <span className="text-lg">{lang.flag}</span>
          <span className="hidden md:inline ml-1">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}

export default LanguageSwitcher;
