-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 08_examinations.sql
-- =============================================================================

-- Past Papers
CREATE TABLE past_papers (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    subject_id UUID NOT NULL
        REFERENCES subjects(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    year INTEGER,

    paper_type paper_type,

    pdf_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions
CREATE TABLE questions (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    paper_id UUID NOT NULL
        REFERENCES past_papers(id)
        ON DELETE CASCADE,

    topic_id UUID
        REFERENCES topics(id)
        ON DELETE SET NULL,

    question_text TEXT NOT NULL,

    question_type question_type DEFAULT 'multiple_choice',

    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,

    correct_answer TEXT,

    marks INTEGER DEFAULT 1
);

-- Exam Attempts
CREATE TABLE exam_attempts (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    paper_id UUID NOT NULL
        REFERENCES past_papers(id)
        ON DELETE CASCADE,

    score DECIMAL,

    percentage DECIMAL,

    grade TEXT,

    status exam_status DEFAULT 'in_progress',

    started_at TIMESTAMPTZ DEFAULT NOW(),

    submitted_at TIMESTAMPTZ
);

-- Student Answers
CREATE TABLE student_answers (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attempt_id UUID NOT NULL
        REFERENCES exam_attempts(id)
        ON DELETE CASCADE,

    question_id UUID NOT NULL
        REFERENCES questions(id)
        ON DELETE CASCADE,

    answer TEXT,

    marks_awarded DECIMAL DEFAULT 0,

    is_correct BOOLEAN,

    UNIQUE(attempt_id, question_id)
);