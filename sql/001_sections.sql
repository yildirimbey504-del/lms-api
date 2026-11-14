-- Execute AFTER the existing courses table has been created.
-- PostgreSQL. The courses table must have an integer primary key named id.
CREATE TABLE IF NOT EXISTS sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL DEFAULT 1 CHECK (position >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sections_course_position
    ON sections (course_id, position, id);
