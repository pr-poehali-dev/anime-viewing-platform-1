-- Обновление пароля администратора (admin123 хэш через bcrypt)
UPDATE users SET password_hash = '$2b$10$N9qo8uLOickgx2ZMRZoMye/56MoJ6V8QZSM.3kUJZJ6vP3a8lPoUe' WHERE username = 'admin';

-- Добавление тестовых данных аниме
INSERT INTO anime (title, description, cover_url, video_url, rating, year, episodes) VALUES 
    ('Sword Art Online', 'Киригая Кадзуто попадает в виртуальную реальность, где единственный способ выжить — победить всех боссов.', 
     'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/5a0fab5f-7ffd-42c0-ae48-f5f2d231fe67.jpg', 
     'https://www.youtube.com/embed/dQw4w9WgXcQ', 8.5, 2024, 24),
    ('Attack on Titan', 'Человечество оказалось на грани вымирания из-за появления гигантских титанов.', 
     'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/a9ee8f94-bcbc-499d-8016-eebee0a657d4.jpg', 
     'https://www.youtube.com/embed/dQw4w9WgXcQ', 9.1, 2024, 12),
    ('Demon Slayer', 'История мальчика, который становится охотником на демонов после трагедии.', 
     'https://cdn.poehali.dev/projects/f11f0a86-31f6-43fa-a84e-d173e4c010e3/files/9e7dcc3b-0027-456f-8188-8af82d361ff8.jpg', 
     'https://www.youtube.com/embed/dQw4w9WgXcQ', 8.7, 2023, 26);

-- Привязка жанров к аниме
INSERT INTO anime_genres (anime_id, genre_id) 
SELECT a.id, g.id FROM anime a, genres g 
WHERE (a.title = 'Sword Art Online' AND g.name IN ('Экшен', 'Фэнтези', 'Приключения'))
   OR (a.title = 'Attack on Titan' AND g.name IN ('Экшен', 'Драма', 'Фантастика'))
   OR (a.title = 'Demon Slayer' AND g.name IN ('Экшен', 'Драма'));