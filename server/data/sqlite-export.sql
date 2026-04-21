-- Generated from SQLite for PostgreSQL import
BEGIN;
TRUNCATE TABLE lesson_teachers, lesson_levels, lessons, teachers, directions, levels, studio_settings RESTART IDENTITY CASCADE;
INSERT INTO directions (id, name, description) VALUES
(1, 'Lady Style (соло)', 'Женская пластика, осанка и музыкальность. На занятии разбираются связки и акценты корпуса.'),
(2, 'Бачата в паре', 'Работа в паре: ведение, следование, базовые и развивающие элементы. Фокус на комфортном взаимодействии.'),
(3, 'Общее хорео (соло)', 'Танцевальные комбинации в сольном формате. Развивает координацию, память движений и уверенность в танце.'),
(4, 'Бачата интенсив "Украшения в паре"', 'Интенсив по музыкальным и визуальным украшениям в парной бачате. Подходит для расширения танцевального словаря.'),
(5, 'Вечеринка', 'Практика в свободном формате: социальные танцы, закрепление материала и общение.'),
(6, 'Реггетон', NULL);
INSERT INTO levels (id, name, color) VALUES
(1, 'Начинающие', '#10b981'),
(2, 'Продолжающие', '#3b82f6'),
(3, 'Новички', '#f59e0b');
INSERT INTO teachers (id, name, photo) VALUES
(5, 'Кеулемжай', 'teachers/cdadceab-fab9-4bdb-9818-dcefece4b8ad.jpg'),
(7, 'Татьяна', 'teachers/93685bd0-0020-450a-b779-ca318f0c2402.jpg');
INSERT INTO studio_settings (id, school_name, logo_path) VALUES
(1, 'BachataMania', 'branding/4697758c-8a62-4333-a941-88e295462bef.png');
INSERT INTO lessons (id, day, time, end_time, crosses_midnight, direction_id, poster) VALUES
(1, 'Понедельник', '19:30', '20:30', FALSE, 1, NULL),
(2, 'Понедельник', '20:30', '21:30', FALSE, 2, NULL),
(3, 'Вторник', '19:30', '20:30', FALSE, 3, NULL),
(4, 'Вторник', '20:30', '21:30', FALSE, 2, NULL),
(5, 'Среда', '19:30', '20:30', FALSE, 1, NULL),
(6, 'Среда', '20:30', '21:30', FALSE, 2, NULL),
(7, 'Четверг', '19:30', '20:30', FALSE, 3, NULL),
(8, 'Четверг', '20:30', '21:30', FALSE, 2, NULL),
(9, 'Пятница', '19:30', '20:30', FALSE, 1, NULL),
(10, 'Пятница', '20:30', '22:30', FALSE, 4, NULL),
(19, 'Суббота', '20:00', '23:00', FALSE, 5, 'posters/be693c41-3feb-479d-ab36-6dc2e7d98bd8.webp'),
(20, 'Воскресенье', '13:00', '14:00', FALSE, 1, NULL);
INSERT INTO lesson_levels (lesson_id, level_id) VALUES
(1, 2),
(2, 1),
(3, 3),
(3, 1),
(4, 2),
(5, 2),
(6, 1),
(7, 3),
(7, 1),
(8, 2),
(9, 3),
(9, 1),
(20, 3),
(20, 1);
INSERT INTO lesson_teachers (lesson_id, teacher_id) VALUES
(1, 7),
(2, 5),
(2, 7),
(3, 5),
(4, 5),
(4, 7),
(5, 7),
(6, 5),
(6, 7),
(7, 5),
(8, 5),
(8, 7),
(9, 7),
(10, 5),
(10, 7),
(20, 7);
COMMIT;
