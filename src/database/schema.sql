create table if not exists courses (
    id serial primary key,
    name varchar,
    length integer
);

create table if not exists students (
    id serial primary key,
    name varchar unique,
    courseid integer references courses on delete
    set
        null,
        semester integer
);