-- Создание таблиц для аниме-платформы

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица аниме
CREATE TABLE IF NOT EXISTS anime (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    cover_url TEXT,
    video_url TEXT,
    rating DECIMAL(3,1) DEFAULT 0.0,
    year INTEGER,
    episodes INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица жанров
CREATE TABLE IF NOT EXISTS genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Связь аниме и жанров (многие ко многим)
CREATE TABLE IF NOT EXISTS anime_genres (
    anime_id INTEGER REFERENCES anime(id),
    genre_id INTEGER REFERENCES genres(id),
    PRIMARY KEY (anime_id, genre_id)
);

-- Избранное пользователей
CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER REFERENCES users(id),
    anime_id INTEGER REFERENCES anime(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, anime_id)
);

-- История просмотров
CREATE TABLE IF NOT EXISTS watch_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    anime_id INTEGER REFERENCES anime(id),
    watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_anime_title ON anime(title);
CREATE INDEX IF NOT EXISTS idx_watch_history_user ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Вставка базовых жанров
INSERT INTO genres (name) VALUES 
    ('Экшен'),
    ('Фэнтези'),
    ('Драма'),
    ('Комедия'),
    ('Романтика'),
    ('Сёнен'),
    ('Приключения'),
    ('Фантастика'),
    ('Сверхъестественное'),
    ('Супергерои')
ON CONFLICT (name) DO NOTHING;

-- Создание администратора по умолчанию (пароль: admin123)
INSERT INTO users (username, password_hash, is_admin) VALUES 
    ('admin', '$2b$10$rQZ9vK7qZ5qZ5qZ5qZ5qZ.dummy', TRUE)
ON CONFLICT (username) DO NOTHING;