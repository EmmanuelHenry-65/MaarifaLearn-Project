-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 15_my_learning_dynamic.sql
--
-- Backs the /my-learning page with real data:
--   1. Auto-create a profiles row on signup (progress/bookmarks FK to profiles)
--   2. Add exact-match slugs to lessons/topics so they can be joined against
--      the static curriculum IDs used by src/data/workspaceData.ts
--   3. Seed the 9 subjects/lessons/topics from workspaceData.ts
--   4. Let bookmarks target a topic directly (previously resource_id only)
--   5. Add the RLS policies progress/bookmarks were missing (0 policies today
--      means those tables are currently unusable by any client role)
--   6. Enable + expose subjects/lessons/topics for authenticated read
--
-- Safe to re-run: every step is idempotent (ON CONFLICT / IF NOT EXISTS / DROP
-- POLICY IF EXISTS).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Auto-create profiles on signup
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 2. Slugs for exact-match joins with the static Workspace curriculum
-- -----------------------------------------------------------------------------

ALTER TABLE lessons ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- -----------------------------------------------------------------------------
-- 3. Seed curriculum (subjects -> lessons -> topics)
-- -----------------------------------------------------------------------------

INSERT INTO subjects (name, code, description) VALUES
    ('Mathematics', 'mathematics', 'Number, algebra, geometry, statistics, trigonometry, and practical problem-solving aligned to CBE competencies.'),
    ('English', 'english', 'Reading, grammar, writing, oral communication, literature, and composition for confident communication.'),
    ('Kiswahili', 'kiswahili', 'Ufahamu, insha, sarufi, fasihi, msamiati, na mawasiliano kwa ufasaha.'),
    ('ICT', 'ict', 'Digital literacy, productivity tools, safe internet use, data handling, and practical technology workflows.'),
    ('Physical Education (PE)', 'pe', 'Movement skills, fitness, sports rules, wellness, teamwork, and personal health routines.'),
    ('Community Service Learning (CSL)', 'csl', 'Community problem solving, reflection, project planning, evidence collection, and service impact.'),
    ('Physics', 'physics', 'Motion, forces, energy, waves, electricity, measurement, experiments, and scientific reasoning.'),
    ('Chemistry', 'chemistry', 'Atomic structure, bonding, acids and bases, chemical reactions, laboratory skills, and analysis.'),
    ('Computer Studies', 'computer-studies', 'Programming logic, algorithms, data representation, systems, networks, and practical computing tasks.')
ON CONFLICT (code) DO NOTHING;

-- Lessons: (subject_code, slug, title, lesson_order)
INSERT INTO lessons (subject_id, slug, title, lesson_order)
SELECT s.id, l.slug, l.title, l.lesson_order
FROM (VALUES
    ('mathematics', 'linear-equations', 'Linear Equations', 1),
    ('mathematics', 'simultaneous-equations', 'Simultaneous Equations', 2),
    ('mathematics', 'quadratics', 'Quadratics', 3),
    ('mathematics', 'circle-theorems', 'Circle Theorems', 4),
    ('mathematics', 'data-analysis', 'Data Analysis', 5),
    ('mathematics', 'trig-ratios', 'Trigonometric Ratios', 6),
    ('english', 'comprehension', 'Comprehension Strategies', 1),
    ('english', 'narrative-writing', 'Narrative Writing', 2),
    ('english', 'sentence-control', 'Sentence Control', 3),
    ('kiswahili', 'aina-za-maneno', 'Aina za Maneno', 1),
    ('kiswahili', 'insha-ya-maelezo', 'Insha ya Maelezo', 2),
    ('kiswahili', 'ufahamu-wa-kifungu', 'Ufahamu wa Kifungu', 3),
    ('ict', 'safe-internet', 'Safe Internet Use', 1),
    ('ict', 'spreadsheets', 'Spreadsheets', 2),
    ('pe', 'activity-tracking', 'Activity Tracking', 1),
    ('pe', 'team-games', 'Team Games', 2),
    ('csl', 'community-mapping', 'Community Mapping', 1),
    ('csl', 'service-journal', 'Service Journal', 2),
    ('physics', 'motion', 'Motion', 1),
    ('physics', 'circuits', 'Electric Circuits', 2),
    ('chemistry', 'ionic-covalent', 'Ionic and Covalent Bonding', 1),
    ('chemistry', 'balancing-equations', 'Balancing Equations', 2),
    ('computer-studies', 'pseudocode', 'Pseudocode', 1),
    ('computer-studies', 'variables-and-logic', 'Variables and Logic', 2)
) AS l(subject_code, slug, title, lesson_order)
JOIN subjects s ON s.code = l.subject_code
ON CONFLICT (slug) DO NOTHING;

-- Topics: derived from each lesson's topic titles (slug = <lesson-slug>-topic-<n>, matching
-- the `makeTopics` id scheme in src/data/workspaceData.ts)
INSERT INTO topics (lesson_id, slug, title)
SELECT l.id, t.slug, t.title
FROM (VALUES
    ('linear-equations', 'linear-equations-topic-1', 'Solving one-step equations'),
    ('linear-equations', 'linear-equations-topic-2', 'Solving two-step equations'),
    ('linear-equations', 'linear-equations-topic-3', 'Word problems'),
    ('simultaneous-equations', 'simultaneous-equations-topic-1', 'Elimination method'),
    ('simultaneous-equations', 'simultaneous-equations-topic-2', 'Substitution method'),
    ('simultaneous-equations', 'simultaneous-equations-topic-3', 'Real-world systems'),
    ('quadratics', 'quadratics-topic-1', 'Factorisation'),
    ('quadratics', 'quadratics-topic-2', 'Completing the square'),
    ('quadratics', 'quadratics-topic-3', 'Quadratic graphs'),
    ('circle-theorems', 'circle-theorems-topic-1', 'Angles in a circle'),
    ('circle-theorems', 'circle-theorems-topic-2', 'Tangents'),
    ('circle-theorems', 'circle-theorems-topic-3', 'Cyclic quadrilaterals'),
    ('data-analysis', 'data-analysis-topic-1', 'Mean median mode'),
    ('data-analysis', 'data-analysis-topic-2', 'Quartiles'),
    ('data-analysis', 'data-analysis-topic-3', 'Histograms'),
    ('trig-ratios', 'trig-ratios-topic-1', 'Sine cosine tangent'),
    ('trig-ratios', 'trig-ratios-topic-2', 'Angles of elevation'),
    ('trig-ratios', 'trig-ratios-topic-3', 'Bearings'),
    ('comprehension', 'comprehension-topic-1', 'Skimming and scanning'),
    ('comprehension', 'comprehension-topic-2', 'Inference'),
    ('comprehension', 'comprehension-topic-3', 'Author purpose'),
    ('narrative-writing', 'narrative-writing-topic-1', 'Plot structure'),
    ('narrative-writing', 'narrative-writing-topic-2', 'Character voice'),
    ('narrative-writing', 'narrative-writing-topic-3', 'Editing for impact'),
    ('sentence-control', 'sentence-control-topic-1', 'Clauses'),
    ('sentence-control', 'sentence-control-topic-2', 'Punctuation'),
    ('sentence-control', 'sentence-control-topic-3', 'Common errors'),
    ('aina-za-maneno', 'aina-za-maneno-topic-1', 'Nomino'),
    ('aina-za-maneno', 'aina-za-maneno-topic-2', 'Vitenzi'),
    ('aina-za-maneno', 'aina-za-maneno-topic-3', 'Vivumishi'),
    ('insha-ya-maelezo', 'insha-ya-maelezo-topic-1', 'Muundo'),
    ('insha-ya-maelezo', 'insha-ya-maelezo-topic-2', 'Msamiati'),
    ('insha-ya-maelezo', 'insha-ya-maelezo-topic-3', 'Uhariri'),
    ('ufahamu-wa-kifungu', 'ufahamu-wa-kifungu-topic-1', 'Hoja kuu'),
    ('ufahamu-wa-kifungu', 'ufahamu-wa-kifungu-topic-2', 'Maana ya maneno'),
    ('ufahamu-wa-kifungu', 'ufahamu-wa-kifungu-topic-3', 'Hitimisho'),
    ('safe-internet', 'safe-internet-topic-1', 'Passwords'),
    ('safe-internet', 'safe-internet-topic-2', 'Privacy'),
    ('safe-internet', 'safe-internet-topic-3', 'Cyberbullying'),
    ('spreadsheets', 'spreadsheets-topic-1', 'Cell references'),
    ('spreadsheets', 'spreadsheets-topic-2', 'Formulas'),
    ('spreadsheets', 'spreadsheets-topic-3', 'Charts'),
    ('activity-tracking', 'activity-tracking-topic-1', 'Warm ups'),
    ('activity-tracking', 'activity-tracking-topic-2', 'Cardio tracking'),
    ('activity-tracking', 'activity-tracking-topic-3', 'Recovery'),
    ('team-games', 'team-games-topic-1', 'Rules'),
    ('team-games', 'team-games-topic-2', 'Positions'),
    ('team-games', 'team-games-topic-3', 'Fair play'),
    ('community-mapping', 'community-mapping-topic-1', 'Identify needs'),
    ('community-mapping', 'community-mapping-topic-2', 'Stakeholders'),
    ('community-mapping', 'community-mapping-topic-3', 'Project goals'),
    ('service-journal', 'service-journal-topic-1', 'Daily entries'),
    ('service-journal', 'service-journal-topic-2', 'Evidence'),
    ('service-journal', 'service-journal-topic-3', 'Impact'),
    ('motion', 'motion-topic-1', 'Speed velocity acceleration'),
    ('motion', 'motion-topic-2', 'Distance-time graphs'),
    ('motion', 'motion-topic-3', 'Equations of motion'),
    ('circuits', 'circuits-topic-1', 'Current'),
    ('circuits', 'circuits-topic-2', 'Voltage'),
    ('circuits', 'circuits-topic-3', 'Resistance'),
    ('ionic-covalent', 'ionic-covalent-topic-1', 'Electron transfer'),
    ('ionic-covalent', 'ionic-covalent-topic-2', 'Sharing electrons'),
    ('ionic-covalent', 'ionic-covalent-topic-3', 'Properties'),
    ('balancing-equations', 'balancing-equations-topic-1', 'Reactants'),
    ('balancing-equations', 'balancing-equations-topic-2', 'Products'),
    ('balancing-equations', 'balancing-equations-topic-3', 'Coefficients'),
    ('pseudocode', 'pseudocode-topic-1', 'Sequence'),
    ('pseudocode', 'pseudocode-topic-2', 'Selection'),
    ('pseudocode', 'pseudocode-topic-3', 'Iteration'),
    ('variables-and-logic', 'variables-and-logic-topic-1', 'Data types'),
    ('variables-and-logic', 'variables-and-logic-topic-2', 'Operators'),
    ('variables-and-logic', 'variables-and-logic-topic-3', 'Control flow')
) AS t(lesson_slug, slug, title)
JOIN lessons l ON l.slug = t.lesson_slug
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4. Let bookmarks target a topic directly (My Learning bookmarks topics, not
--    library resources)
-- -----------------------------------------------------------------------------

ALTER TABLE bookmarks ALTER COLUMN resource_id DROP NOT NULL;
ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS topic_id UUID REFERENCES topics(id) ON DELETE CASCADE;

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_target_check;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_target_check
    CHECK (resource_id IS NOT NULL OR topic_id IS NOT NULL);

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_profile_id_topic_id_key;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_profile_id_topic_id_key UNIQUE (profile_id, topic_id);

-- -----------------------------------------------------------------------------
-- 5. RLS policies progress/bookmarks were missing entirely (RLS was enabled
--    with zero policies, which blocks all access for every client role)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users manage own progress" ON progress;
CREATE POLICY "Users manage own progress"
ON progress
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users manage own bookmarks" ON bookmarks;
CREATE POLICY "Users manage own bookmarks"
ON bookmarks
FOR ALL
USING (auth.uid() = profile_id)
WITH CHECK (auth.uid() = profile_id);

-- -----------------------------------------------------------------------------
-- 6. Curriculum tables: enable RLS, expose read-only to authenticated users
--    (previously had no RLS at all, i.e. unrestricted)
-- -----------------------------------------------------------------------------

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read subjects" ON subjects;
CREATE POLICY "Authenticated users can read subjects"
ON subjects FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read lessons" ON lessons;
CREATE POLICY "Authenticated users can read lessons"
ON lessons FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read topics" ON topics;
CREATE POLICY "Authenticated users can read topics"
ON topics FOR SELECT
TO authenticated
USING (true);
