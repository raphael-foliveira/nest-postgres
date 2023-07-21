CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
name VARCHAR UNIQUE,
    length INTEGER
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR UNIQUE,
    courseid INTEGER REFERENCES courses ON DELETE
    SET
        NULL,
        semester INTEGER
);