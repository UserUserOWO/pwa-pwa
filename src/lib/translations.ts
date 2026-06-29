export type Lang = "en" | "ru";

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Navbar
    "nav.home": "PeopleReview",
    "nav.profile": "Profile",

    // Home page
    "home.badge": "MVP Launch",
    "home.title.line1": "Reviews about",
    "home.title.line2": "people",
    "home.desc": "Create a profile, get a personal QR code and collect reviews from people you interact with. Simple, transparent, honest.",
    "home.cta.start": "Get Started",
    "home.cta.signin": "Sign In",
    "feature.create.title": "Create Profile",
    "feature.create.desc": "Set up your profile with photo, description and hashtags",
    "feature.qr.title": "Get QR Code",
    "feature.qr.desc": "Receive a personal QR code to share with people",
    "feature.reviews.title": "Collect Reviews",
    "feature.reviews.desc": "Get honest feedback from people you interact with",

    // Auth
    "auth.welcome": "Welcome back",
    "auth.signin.subtitle": "Sign in to your account",
    "auth.signin.btn": "Sign In",
    "auth.signin.loading": "Signing in...",
    "auth.register.title": "Create account",
    "auth.register.subtitle": "Start your journey",
    "auth.register.btn": "Create Account",
    "auth.register.loading": "Creating account...",
    "auth.noaccount": "Don't have an account?",
    "auth.hasaccount": "Already have an account?",
    "auth.register.link": "Register",
    "auth.signin.link": "Sign In",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.name": "Name",

    // Feed
    "feed.title": "Feed",
    "feed.empty.title": "No reviews yet",
    "feed.empty.desc": "Be the first to leave a review!",

    // Profile
    "profile.reviews": "Reviews",
    "profile.rating": "Rating",
    "profile.download_qr": "Download QR Code",
    "profile.review.btn": "Leave a Review",
    "profile.review.cancel": "Cancel",
    "profile.review.submit": "Submit Review",
    "profile.review.submitting": "Submitting...",
    "profile.review.rating": "Rating",
    "profile.review.text": "Review",
    "profile.review.placeholder": "Share your experience...",
    "profile.notfound": "Profile not found",
    "profile.noreviews": "No reviews yet",

    // Settings
    "settings.title": "Settings",
    "settings.name": "Name",
    "settings.description": "Description",
    "settings.hashtags": "Hashtags (comma separated)",
    "settings.hashtags.placeholder": "developer, design, travel",
    "settings.save": "Save Changes",
    "settings.saving": "Saving...",
    "settings.success": "Profile updated successfully!",
    "settings.uploading": "Uploading...",

    // Search
    "search.title": "Search People",
    "search.placeholder": "Search by name or hashtag...",
    "search.empty.title": "No results found",
    "search.empty.desc": "Try a different search query",
    "search.idle.title": "Find people",
    "search.idle.desc": "Search by name or hashtag to find people",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.today": "Today",
    "common.yesterday": "Yesterday",
    "common.days_ago": "days ago",
  },

  ru: {
    // Navbar
    "nav.home": "PeopleReview",
    "nav.profile": "Профиль",

    // Home page
    "home.badge": "MVP Запуск",
    "home.title.line1": "Отзывы о",
    "home.title.line2": "людях",
    "home.desc": "Создайте профиль, получите QR-код и собирайте отзывы от людей, с которыми вы взаимодействуете. Просто, прозрачно, честно.",
    "home.cta.start": "Начать",
    "home.cta.signin": "Войти",
    "feature.create.title": "Создать профиль",
    "feature.create.desc": "Заполните профиль: фото, описание и хэштеги",
    "feature.qr.title": "Получить QR-код",
    "feature.qr.desc": "Ваш персональный QR-код для обмена с людьми",
    "feature.reviews.title": "Собирать отзывы",
    "feature.reviews.desc": "Получайте честную обратную связь от людей",

    // Auth
    "auth.welcome": "С возвращением",
    "auth.signin.subtitle": "Войдите в аккаунт",
    "auth.signin.btn": "Войти",
    "auth.signin.loading": "Вход...",
    "auth.register.title": "Создать аккаунт",
    "auth.register.subtitle": "Начните свой путь",
    "auth.register.btn": "Создать аккаунт",
    "auth.register.loading": "Создание аккаунта...",
    "auth.noaccount": "Нет аккаунта?",
    "auth.hasaccount": "Уже есть аккаунт?",
    "auth.register.link": "Регистрация",
    "auth.signin.link": "Войти",
    "auth.email": "Эл. почта",
    "auth.password": "Пароль",
    "auth.name": "Имя",

    // Feed
    "feed.title": "Лента",
    "feed.empty.title": "Отзывов пока нет",
    "feed.empty.desc": "Будьте первым, кто оставит отзыв!",

    // Profile
    "profile.reviews": "Отзывы",
    "profile.rating": "Рейтинг",
    "profile.download_qr": "Скачать QR-код",
    "profile.review.btn": "Оставить отзыв",
    "profile.review.cancel": "Отмена",
    "profile.review.submit": "Отправить отзыв",
    "profile.review.submitting": "Отправка...",
    "profile.review.rating": "Оценка",
    "profile.review.text": "Отзыв",
    "profile.review.placeholder": "Поделитесь опытом...",
    "profile.notfound": "Профиль не найден",
    "profile.noreviews": "Отзывов пока нет",

    // Settings
    "settings.title": "Настройки",
    "settings.name": "Имя",
    "settings.description": "Описание",
    "settings.hashtags": "Хэштеги (через запятую)",
    "settings.hashtags.placeholder": "разработчик, дизайн, путешествия",
    "settings.save": "Сохранить",
    "settings.saving": "Сохранение...",
    "settings.success": "Профиль обновлён!",
    "settings.uploading": "Загрузка...",

    // Search
    "search.title": "Поиск людей",
    "search.placeholder": "Поиск по имени или хэштегу...",
    "search.empty.title": "Ничего не найдено",
    "search.empty.desc": "Попробуйте другой запрос",
    "search.idle.title": "Найти людей",
    "search.idle.desc": "Ищите людей по имени или хэштегу",

    // Common
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.today": "Сегодня",
    "common.yesterday": "Вчера",
    "common.days_ago": "дн. назад",
  },
};