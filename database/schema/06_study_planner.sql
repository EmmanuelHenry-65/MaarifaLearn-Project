-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 06_study_planner.sql
-- =============================================================================

-- Study Plans
CREATE TABLE study_plans (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    profile_id UUID NOT NULL
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    start_date DATE,

    end_date DATE,

    status study_plan_status DEFAULT 'active',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Tasks
CREATE TABLE study_tasks (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    study_plan_id UUID NOT NULL
        REFERENCES study_plans(id)
        ON DELETE CASCADE,

    lesson_id UUID
        REFERENCES lessons(id)
        ON DELETE SET NULL,

    title TEXT NOT NULL,

    due_date DATE,

    priority task_priority DEFAULT 'medium',

    completed BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);