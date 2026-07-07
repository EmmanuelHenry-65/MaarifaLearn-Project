-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: seed_data.sql
--
-- Seeds real content for the Past Papers / Exam Center feature:
--   18 past_papers (2 per subject) and ~90 questions (5 per paper).
--
-- Subjects themselves are already seeded by
-- database/schema/16_my_learning_dynamic.sql -- this file only needs to run
-- AFTER the full schema/ directory (in numeric order, including
-- 20_examinations_extensions.sql) has been applied.
--
-- Question type mix per paper: 2 multiple_choice, 1 true_false (both
-- auto-graded by submit_exam_attempt()), 1 short_answer, 1 essay (both
-- recorded as pending review -- see 20_examinations_extensions.sql).
-- multiple_choice.correct_answer stores the option letter (a/b/c/d);
-- true_false.correct_answer stores 'true'/'false'. Both are lowercase to
-- match the grading function's case-insensitive comparison.
--
-- Safe to re-run: past_papers uses slug + ON CONFLICT DO NOTHING; questions
-- are skipped per-paper if that paper already has any (see the
-- WHERE NOT EXISTS guard below).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Past papers
-- -----------------------------------------------------------------------------

INSERT INTO past_papers (subject_id, slug, title, year, term, paper_type, duration_minutes, difficulty)
SELECT s.id, p.slug, p.title, p.year, p.term, p.paper_type::paper_type, p.duration_minutes, p.difficulty::difficulty_level
FROM (VALUES
    ('mathematics', 'mathematics-2024-paper-1', 'Mathematics Paper 1: Algebra & Equations', 2024, 'Term 1', 'kcse', 60, 'medium'),
    ('mathematics', 'mathematics-2025-paper-2', 'Mathematics Paper 2: Geometry & Statistics', 2025, 'Term 2', 'mock', 75, 'hard'),
    ('english', 'english-2024-paper-1', 'English Paper 1: Grammar & Comprehension', 2024, 'Term 1', 'kcse', 60, 'medium'),
    ('english', 'english-2025-paper-2', 'English Paper 2: Composition & Literature', 2025, 'Term 2', 'mock', 90, 'hard'),
    ('kiswahili', 'kiswahili-2024-paper-1', 'Karatasi ya 1: Sarufi', 2024, 'Term 1', 'kcse', 60, 'medium'),
    ('kiswahili', 'kiswahili-2025-paper-2', 'Karatasi ya 2: Fasihi na Insha', 2025, 'Term 2', 'mock', 90, 'hard'),
    ('ict', 'ict-2024-paper-1', 'ICT Paper 1: Digital Literacy & Safety', 2024, 'Term 1', 'kcse', 60, 'medium'),
    ('ict', 'ict-2025-paper-2', 'ICT Paper 2: Spreadsheets & Data', 2025, 'Term 2', 'mock', 75, 'hard'),
    ('pe', 'pe-2024-paper-1', 'PE Paper 1: Fitness & Health', 2024, 'Term 1', 'kcse', 90, 'medium'),
    ('pe', 'pe-2025-paper-2', 'PE Paper 2: Sports & Teamwork', 2025, 'Term 2', 'mock', 90, 'hard'),
    ('csl', 'csl-2024-paper-1', 'CSL Paper 1: Community Mapping', 2024, 'Term 1', 'kcse', 90, 'medium'),
    ('csl', 'csl-2025-paper-2', 'CSL Paper 2: Project Planning & Reflection', 2025, 'Term 2', 'mock', 90, 'hard'),
    ('physics', 'physics-2024-paper-1', 'Physics Paper 1: Motion & Forces', 2024, 'Term 1', 'kcse', 90, 'medium'),
    ('physics', 'physics-2025-paper-2', 'Physics Paper 2: Electricity & Circuits', 2025, 'Term 2', 'mock', 90, 'hard'),
    ('chemistry', 'chemistry-2024-paper-1', 'Chemistry Paper 1: Atomic Structure & Bonding', 2024, 'Term 1', 'kcse', 90, 'medium'),
    ('chemistry', 'chemistry-2025-paper-2', 'Chemistry Paper 2: Acids, Bases & Reactions', 2025, 'Term 2', 'mock', 90, 'hard'),
    ('computer-studies', 'computer-studies-2024-paper-1', 'Computer Studies Paper 1: Pseudocode & Algorithms', 2024, 'Term 1', 'kcse', 90, 'medium'),
    ('computer-studies', 'computer-studies-2025-paper-2', 'Computer Studies Paper 2: Data Representation & Programming', 2025, 'Term 2', 'mock', 90, 'hard')
) AS p(subject_code, slug, title, year, term, paper_type, duration_minutes, difficulty)
JOIN subjects s ON s.code = p.subject_code
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Questions
-- -----------------------------------------------------------------------------

INSERT INTO questions (paper_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, marks, marking_scheme, ai_explanation)
SELECT pp.id, q.question_text, q.question_type::question_type, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.marks, q.marking_scheme, q.ai_explanation
FROM (VALUES

-- Mathematics Paper 1: Algebra & Equations
('mathematics-2024-paper-1', 'Solve for x: 2x + 5 = 15.', 'multiple_choice', '5', '10', '7.5', '-5', 'a', 4,
 'Award full marks for x = 5, obtained by subtracting 5 from both sides then dividing by 2.',
 'Isolate x by first subtracting 5 from both sides to get 2x = 10, then dividing both sides by 2.'),
('mathematics-2024-paper-1', 'Which of the following is a quadratic equation?', 'multiple_choice', 'y = 2x + 3', 'y = x^2 - 4x + 3', 'y = 5', 'y = 1/x', 'b', 4,
 'Award full marks for identifying the equation with a squared term as quadratic.',
 'A quadratic equation has a term with x raised to the power of 2 as its highest power.'),
('mathematics-2024-paper-1', 'The sum of angles in a triangle is always 180 degrees.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True -- this is a fundamental property of triangles in Euclidean geometry.',
 'This holds for any triangle regardless of its shape or size, as long as it is a flat (Euclidean) triangle.'),
('mathematics-2024-paper-1', 'Simplify: 3(x + 4) - 2x.', 'short_answer', NULL, NULL, NULL, NULL, 'x + 12', 6,
 'Award full marks for x + 12; partial marks for correct expansion (3x + 12 - 2x) without final simplification.',
 'Expand the bracket first (3x + 12), then combine like terms (3x - 2x = x) to reach x + 12.'),
('mathematics-2024-paper-1', 'Explain, with an example, how simultaneous equations can be used to solve a real-life problem involving the cost of items.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct setup of two equations from a real scenario, a valid method (elimination or substitution), an accurate solution, and a realistic example.',
 'A strong answer defines two unknowns, writes two equations linking them, solves systematically, and checks the answer makes sense in context.'),

-- Mathematics Paper 2: Geometry & Statistics
('mathematics-2025-paper-2', 'What is the median of the data set: 3, 7, 9, 12, 15?', 'multiple_choice', '7', '9', '12', '9.5', 'b', 4,
 'Award full marks for 9, the middle value once the data set is ordered.',
 'With 5 ordered values, the median is the 3rd value: 9.'),
('mathematics-2025-paper-2', 'A circle has a radius of 7cm. What is its circumference? (Use pi = 22/7)', 'multiple_choice', '44cm', '22cm', '154cm', '49cm', 'a', 4,
 'Award full marks for 44cm using circumference = 2 x pi x r.',
 'Circumference = 2 x (22/7) x 7 = 44cm.'),
('mathematics-2025-paper-2', 'A tangent to a circle touches the circle at exactly one point.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True -- this is the defining property of a tangent line.',
 'A tangent touches a circle at a single point and does not cross into the circle''s interior.'),
('mathematics-2025-paper-2', 'Calculate the area of a triangle with base 10cm and height 6cm.', 'short_answer', NULL, NULL, NULL, NULL, '30 cm^2', 6,
 'Award full marks for 30 cm^2 using Area = 1/2 x base x height; partial marks for correct formula without a final answer.',
 'Area = 1/2 x 10 x 6 = 30 cm^2.'),
('mathematics-2025-paper-2', 'Describe how histograms and mean/median/mode can be used together to summarise and interpret a set of exam scores for a class.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct description of histogram construction, correct explanation of measures of central tendency, and a coherent link between the two in interpreting exam performance.',
 'A strong answer shows how a histogram reveals the shape/spread of scores while mean/median/mode summarise it as single representative values, and explains when each measure is most useful.'),

-- English Paper 1: Grammar & Comprehension
('english-2024-paper-1', 'Choose the correctly punctuated sentence.', 'multiple_choice', 'Its raining, isnt it', 'It''s raining, isn''t it?', 'Its raining isnt it.', 'It''s raining isnt it', 'b', 4,
 'Award full marks for correct apostrophe use in contractions and a question mark for a question.',
 '"It''s" is the contraction of "it is", and "isn''t" is the contraction of "is not" -- both need apostrophes, and the sentence is a question.'),
('english-2024-paper-1', 'Identify the part of speech of the underlined word: She sings beautifully.', 'multiple_choice', 'Noun', 'Adjective', 'Adverb', 'Verb', 'c', 4,
 'Award full marks for Adverb -- it describes how the verb "sings" is performed.',
 'Words ending in -ly that modify a verb are usually adverbs, describing manner.'),
('english-2024-paper-1', 'A metaphor makes a direct comparison using ''like'' or ''as''.', 'true_false', 'True', 'False', NULL, NULL, 'false', 2,
 'Award full marks for False -- that describes a simile, not a metaphor.',
 'A metaphor states one thing IS another (e.g. "time is a thief"), while a simile compares using "like" or "as".'),
('english-2024-paper-1', 'Rewrite the following sentence in reported speech: She said, "I am going to the market."', 'short_answer', NULL, NULL, NULL, NULL, 'She said that she was going to the market.', 6,
 'Award full marks for correct tense shift (am -> was) and pronoun change (I -> she).',
 'Reported speech typically shifts present tense to past tense and changes first-person pronouns to match the speaker being reported.'),
('english-2024-paper-1', 'Write a short narrative composition (150-200 words) describing a memorable day at school.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for clear plot structure, appropriate descriptive language, correct grammar and punctuation, and staying within the word count.',
 'Strong narratives have a clear beginning, middle, and end, use sensory detail, and maintain a consistent tense and point of view.'),

-- English Paper 2: Composition & Literature
('english-2025-paper-2', 'Which literary device involves giving human qualities to non-human things?', 'multiple_choice', 'Simile', 'Personification', 'Hyperbole', 'Irony', 'b', 4,
 'Award full marks for Personification.',
 'Personification attributes human traits or actions to objects, animals, or ideas.'),
('english-2025-paper-2', 'What is the main purpose of a thesis statement in an essay?', 'multiple_choice', 'To conclude the essay', 'To state the main argument', 'To list references', 'To greet the reader', 'b', 4,
 'Award full marks for stating the main argument or claim of the essay.',
 'A thesis statement previews the central point the rest of the essay will support with evidence.'),
('english-2025-paper-2', 'An autobiography is written by someone else about a person''s life.', 'true_false', 'True', 'False', NULL, NULL, 'false', 2,
 'Award full marks for False -- that describes a biography, not an autobiography.',
 'An autobiography is written by the subject themselves; a biography is written by someone else about them.'),
('english-2025-paper-2', 'Explain the difference between formal and informal language, giving one example of each.', 'short_answer', NULL, NULL, NULL, NULL, 'Formal language suits official/academic contexts (e.g. "I would like to request..."); informal suits casual conversation (e.g. "Can I get...").', 6,
 'Award marks for a correct distinction based on context/audience appropriateness, and one valid example of each register.',
 'Formal language avoids contractions and slang and follows stricter grammar conventions; informal language is more relaxed and conversational.'),
('english-2025-paper-2', 'Discuss how setting influences the mood of a story, using examples from a novel or short story you have read.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for a clear thesis, relevant textual examples, analysis of the mood/setting relationship, and coherent structure.',
 'Strong answers connect specific descriptive details of a setting (e.g. weather, time, place) to the emotional atmosphere they create.'),

-- Kiswahili Karatasi ya 1: Sarufi
('kiswahili-2024-paper-1', 'Ni neno gani kati ya haya ni kivumishi?', 'multiple_choice', 'kukimbia', 'refu', 'haraka', 'na', 'b', 4,
 'Tuza alama kamili kwa jibu "refu" -- kivumishi kinachoeleza sifa ya nomino.',
 'Kivumishi hueleza sifa ya nomino, kama urefu, rangi, au ukubwa.'),
('kiswahili-2024-paper-1', 'Chagua sentensi iliyo sahihi kisarufi.', 'multiple_choice', 'Yeye anakula chakula.', 'Yeye wanakula chakula.', 'Mimi wanakula chakula.', 'Sisi anakula chakula.', 'a', 4,
 'Tuza alama kamili kwa sentensi yenye upatanisho sahihi wa kiima na kitenzi.',
 'Kiima "Yeye" (umoja) hupatana na kitenzi "anakula", si "wanakula" (wingi).'),
('kiswahili-2024-paper-1', 'Nomino ni jina la kitu, mtu au mahali.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Tuza alama kamili kwa jibu "True".',
 'Nomino hutaja vitu, watu, mahali, au dhana, kama "mti", "mwalimu", au "shule".'),
('kiswahili-2024-paper-1', 'Andika umoja wa neno "vitabu".', 'short_answer', NULL, NULL, NULL, NULL, 'kitabu', 6,
 'Tuza alama kamili kwa jibu "kitabu".',
 'Neno "vitabu" liko katika ngeli ya KI-VI; umoja wake huanza na "ki-" badala ya "vi-".'),
('kiswahili-2024-paper-1', 'Andika insha ya maelezo (maneno 150-200) kuhusu "Umuhimu wa Elimu Katika Jamii".', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Tuza alama kwa muundo mzuri wa insha, hoja zenye mantiki, matumizi sahihi ya sarufi, na kuzingatia idadi ya maneno.',
 'Insha nzuri ina utangulizi, mwili wenye hoja tatu au zaidi zilizotolewa mfano, na hitimisho linalorejea hoja kuu.'),

-- Kiswahili Karatasi ya 2: Fasihi na Insha
('kiswahili-2025-paper-2', 'Fasihi simulizi hujumuisha kipengele gani?', 'multiple_choice', 'Riwaya', 'Ngano', 'Tamthilia iliyoandikwa', 'Insha', 'b', 4,
 'Tuza alama kamili kwa jibu "Ngano" -- kipengele cha fasihi simulizi kinachosemwa kwa mdomo.',
 'Fasihi simulizi hupitishwa kwa mdomo kutoka kizazi kimoja hadi kingine, tofauti na fasihi andishi.'),
('kiswahili-2025-paper-2', 'Mbinu ya kutumia maneno yanayofanana kwa sauti mwanzoni mwa maneno huitwa nini?', 'multiple_choice', 'Tashbihi', 'Sitiari', 'Uradidi', 'Tashititi', 'c', 4,
 'Tuza alama kamili kwa jibu "Uradidi".',
 'Uradidi ni urudiaji wa sauti au maneno mwanzoni mwa maneno yanayokaribiana kwa athari ya kishairi.'),
('kiswahili-2025-paper-2', 'Methali ni usemi mfupi wenye maana ya ndani zaidi ya maneno yenyewe.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Tuza alama kamili kwa jibu "True".',
 'Methali hubeba maana ya kifumbo au funzo ambalo huenda mbali zaidi ya maana ya moja kwa moja ya maneno.'),
('kiswahili-2025-paper-2', 'Taja tofauti moja kati ya shairi la kimapokeo na shairi la kisasa (huru).', 'short_answer', NULL, NULL, NULL, NULL, 'Shairi la kimapokeo huzingatia urari wa vina na mizani; shairi la kisasa (huru) halina masharti hayo.', 6,
 'Tuza alama kwa tofauti sahihi, kwa mfano: masharti ya vina/mizani dhidi ya uhuru wa muundo.',
 'Ushairi wa kimapokeo hufuata kanuni thabiti za idadi ya mizani na urari wa vina, wakati ushairi huru huacha mshairi na uhuru zaidi wa kimuundo.'),
('kiswahili-2025-paper-2', 'Jadili dhima ya methali katika kuhifadhi maadili ya jamii, ukitolea mifano.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Tuza alama kwa hoja zenye mifano sahihi ya methali, uchambuzi wa dhima yake, na muundo mzuri wa insha.',
 'Jibu zuri hutoa angalau methali mbili, huelezea maadili yanayowasilishwa, na huunganisha hoja hizo na jamii husika.'),

-- ICT Paper 1: Digital Literacy & Safety
('ict-2024-paper-1', 'Which of the following is the safest type of password?', 'multiple_choice', '123456', 'password', 'Mk7#pLq2!', 'yourname', 'c', 4,
 'Award full marks for the option combining upper/lowercase letters, numbers, and symbols.',
 'Strong passwords mix character types and avoid common/predictable words, making them harder to guess or crack.'),
('ict-2024-paper-1', 'What does ''URL'' stand for?', 'multiple_choice', 'Uniform Resource Locator', 'Universal Reading Link', 'User Response Log', 'Unified Retrieval Language', 'a', 4,
 'Award full marks for Uniform Resource Locator.',
 'A URL is the address used to locate a specific resource (like a web page) on the internet.'),
('ict-2024-paper-1', 'Sharing your password with a close friend is considered safe practice.', 'true_false', 'True', 'False', NULL, NULL, 'false', 2,
 'Award full marks for False -- passwords should never be shared, even with trusted people.',
 'Sharing a password increases the risk of unauthorised access and makes it harder to trace who used an account.'),
('ict-2024-paper-1', 'State two ways to identify a phishing email.', 'short_answer', NULL, NULL, NULL, NULL, 'Suspicious sender address; urgent/threatening language; unexpected attachments; mismatched or suspicious links.', 6,
 'Award 1 mark each for two valid indicators from: suspicious sender address, urgent/threatening language, unexpected attachments, mismatched links.',
 'Phishing emails often create urgency, impersonate trusted senders, and contain links or attachments designed to steal information.'),
('ict-2024-paper-1', 'Discuss the importance of digital citizenship, including at least three responsible online behaviours students should practise.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for a clear definition, three relevant behaviours with explanation, and a coherent concluding statement.',
 'Strong answers connect digital citizenship to real behaviours like respecting others online, protecting personal data, and verifying information before sharing it.'),

-- ICT Paper 2: Spreadsheets & Data
('ict-2025-paper-2', 'In a spreadsheet, which symbol must precede a formula?', 'multiple_choice', '#', '@', '=', '$', 'c', 4,
 'Award full marks for "=", the standard symbol that tells a spreadsheet a cell contains a formula.',
 'Typing "=" at the start of a cell entry signals to the spreadsheet application that a calculation follows.'),
('ict-2025-paper-2', 'What does the SUM function do?', 'multiple_choice', 'Finds the average', 'Adds a range of values', 'Counts cells', 'Sorts data', 'b', 4,
 'Award full marks for adding a range of values.',
 'SUM totals all numeric values in the specified range of cells.'),
('ict-2025-paper-2', 'A cell reference like $A$1 is an example of an absolute reference.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True.',
 'The dollar signs "lock" both the column and row, so the reference does not change when the formula is copied elsewhere.'),
('ict-2025-paper-2', 'Explain what a ''chart'' is used for in a spreadsheet, giving one example of when you would use one.', 'short_answer', NULL, NULL, NULL, NULL, 'A chart visually represents data to make trends or comparisons easier to see, e.g. a bar chart comparing monthly sales.', 6,
 'Award marks for a correct definition (visual representation of data) and one valid real-world example.',
 'Charts turn rows of numbers into a visual format (bars, lines, pies) that makes patterns and comparisons easier to interpret at a glance.'),
('ict-2025-paper-2', 'Explain how spreadsheets can be used to manage a simple household or class budget, describing at least three features you would use.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for three relevant features (e.g. formulas, charts, conditional formatting) with correct explanation of their use in budgeting.',
 'A strong answer might mention SUM formulas for totals, charts for visualising spending categories, and conditional formatting to flag overspending.'),

-- PE Paper 1: Fitness & Health
('pe-2024-paper-1', 'Which of the following best improves cardiovascular fitness?', 'multiple_choice', 'Stretching', 'Running', 'Sleeping', 'Reading', 'b', 4,
 'Award full marks for Running, an aerobic activity that raises heart rate over a sustained period.',
 'Cardiovascular fitness improves through sustained activities that elevate heart rate, such as running, swimming, or cycling.'),
('pe-2024-paper-1', 'What is the recommended first step before intense physical activity?', 'multiple_choice', 'Cool down', 'Warm up', 'Eat a heavy meal', 'Sprint immediately', 'b', 4,
 'Award full marks for warming up.',
 'Warming up gradually raises heart rate and loosens muscles, reducing injury risk before intense activity.'),
('pe-2024-paper-1', 'Drinking water before, during, and after exercise helps prevent dehydration.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True.',
 'Exercise causes fluid loss through sweat, so replacing water throughout helps maintain performance and health.'),
('pe-2024-paper-1', 'State two benefits of regular physical activity on mental health.', 'short_answer', NULL, NULL, NULL, NULL, 'Reduced stress; improved mood; better sleep; increased self-esteem.', 6,
 'Award 1 mark each for two valid benefits, e.g. reduced stress, improved mood, better sleep, increased self-esteem.',
 'Physical activity releases endorphins and reduces stress hormones, contributing to improved mood and overall mental wellbeing.'),
('pe-2024-paper-1', 'Design a simple weekly fitness plan for a teenager, explaining the types of activities included and why they are beneficial.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for a balanced plan (cardio, strength, flexibility), correct frequency/duration, and clear justification for each activity type.',
 'A well-rounded plan spreads cardio, strength, and flexibility work across the week with rest days, matching general fitness guidelines for teenagers.'),

-- PE Paper 2: Sports & Teamwork
('pe-2025-paper-2', 'In football, what is awarded when a defending player commits a foul inside their own penalty area?', 'multiple_choice', 'Corner kick', 'Free kick', 'Penalty kick', 'Throw-in', 'c', 4,
 'Award full marks for Penalty kick.',
 'Fouls committed by a defending team inside their own penalty area result in a penalty kick for the attacking team.'),
('pe-2025-paper-2', 'Which value is most important for effective teamwork in sports?', 'multiple_choice', 'Selfishness', 'Communication', 'Ignoring teammates', 'Working alone', 'b', 4,
 'Award full marks for Communication.',
 'Clear communication allows teammates to coordinate positioning, strategy, and support during play.'),
('pe-2025-paper-2', 'In basketball, a team has 24 seconds to attempt a shot after gaining possession (shot clock rule).', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True (in competitions using the 24-second shot clock rule, such as FIBA/NBA play).',
 'The shot clock rule keeps the game moving by requiring a team to attempt a shot within a fixed time after gaining possession.'),
('pe-2025-paper-2', 'Explain what ''fair play'' means in the context of sports.', 'short_answer', NULL, NULL, NULL, NULL, 'Fair play means respecting the rules, opponents, and officials, and competing honestly.', 6,
 'Award marks for a definition covering respect for rules, opponents, and officials, with honesty in competition.',
 'Fair play goes beyond following written rules -- it includes sportsmanship, honesty, and respect even when it is not directly enforced.'),
('pe-2025-paper-2', 'Discuss how participating in team sports helps develop leadership and cooperation skills, giving practical examples.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for clear explanation of leadership/cooperation development, at least two practical examples, and coherent structure.',
 'Strong answers link specific team-sport situations (e.g. calling plays, supporting a struggling teammate) directly to leadership or cooperation skills gained.'),

-- CSL Paper 1: Community Mapping
('csl-2024-paper-1', 'What is the first step in identifying a community''s needs?', 'multiple_choice', 'Fundraising', 'Community mapping/needs assessment', 'Writing a report', 'Publicity', 'b', 4,
 'Award full marks for community mapping/needs assessment.',
 'Understanding what a community actually needs must come before planning a response to it.'),
('csl-2024-paper-1', 'Who are ''stakeholders'' in a community service project?', 'multiple_choice', 'Only the project leader', 'Only donors', 'Individuals or groups affected by or interested in the project', 'Only government officials', 'c', 4,
 'Award full marks for the broad definition covering anyone affected by or interested in the project.',
 'Stakeholders can include community members, local leaders, donors, and the students themselves -- anyone with a stake in the outcome.'),
('csl-2024-paper-1', 'A needs assessment should be done after a project is completed, not before.', 'true_false', 'True', 'False', NULL, NULL, 'false', 2,
 'Award full marks for False -- a needs assessment must happen before planning, to ensure the project addresses a real need.',
 'Doing a needs assessment first ensures effort and resources are directed at an actual, verified community need.'),
('csl-2024-paper-1', 'State two methods you could use to gather information about a community''s needs.', 'short_answer', NULL, NULL, NULL, NULL, 'Interviews; surveys; observation; focus group discussions.', 6,
 'Award 1 mark each for two valid methods, e.g. interviews, surveys, observation, focus group discussions.',
 'Combining methods (e.g. surveys for breadth, interviews for depth) usually gives a more accurate picture of community needs.'),
('csl-2024-paper-1', 'Describe the steps you would take to plan a community service project addressing a local environmental problem, from identifying the need to evaluating impact.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for logical sequencing (assessment, planning, implementation, evaluation), relevance to environmental issues, and consideration of stakeholders.',
 'A strong answer moves logically through assessment, goal-setting, implementation, and evaluation, naming stakeholders at each relevant stage.'),

-- CSL Paper 2: Project Planning & Reflection
('csl-2025-paper-2', 'Which document records daily progress and reflections during a CSL project?', 'multiple_choice', 'Budget report', 'Service journal', 'Attendance register', 'Newsletter', 'b', 4,
 'Award full marks for Service journal.',
 'A service journal captures ongoing reflections, observations, and progress notes throughout a project.'),
('csl-2025-paper-2', 'What is ''evidence of impact'' in a CSL project most likely to include?', 'multiple_choice', 'Personal opinions only', 'Photos, testimonials, and measurable outcomes', 'The project title', 'A list of team members', 'b', 4,
 'Award full marks for photos, testimonials, and measurable outcomes.',
 'Credible evidence of impact combines documentation (photos), stakeholder voices (testimonials), and data (measurable outcomes).'),
('csl-2025-paper-2', 'Reflection is an optional part of community service learning and does not affect its educational value.', 'true_false', 'True', 'False', NULL, NULL, 'false', 2,
 'Award full marks for False -- reflection is a core part of what makes service "learning" rather than just service.',
 'Structured reflection is what turns an activity into a learning experience, helping students connect actions to outcomes and values.'),
('csl-2025-paper-2', 'Explain why setting clear, measurable goals is important before starting a community service project.', 'short_answer', NULL, NULL, NULL, NULL, 'Clear, measurable goals make it possible to track progress, evaluate success, and stay focused on the intended outcome.', 6,
 'Award marks for explanation covering ability to track progress, evaluate success, and stay focused on intended outcomes.',
 'Without measurable goals, it becomes difficult to know whether a project actually achieved anything meaningful.'),
('csl-2025-paper-2', 'Reflect on how a community service project can create mutual benefit for both the community and the students involved, providing specific examples.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for balanced discussion of benefits to both community and students, specific examples, and thoughtful reflection.',
 'Strong answers avoid a one-sided view, showing genuine benefit for the community (e.g. a real need met) alongside student growth (e.g. new skills, empathy).'),

-- Physics Paper 1: Motion & Forces
('physics-2024-paper-1', 'What is the SI unit of force?', 'multiple_choice', 'Joule', 'Newton', 'Watt', 'Pascal', 'b', 4,
 'Award full marks for Newton.',
 'Force is measured in newtons (N), named after Isaac Newton, defined via F = ma.'),
('physics-2024-paper-1', 'An object moving at constant velocity has what acceleration?', 'multiple_choice', 'Increasing', 'Decreasing', 'Zero', 'Infinite', 'c', 4,
 'Award full marks for Zero.',
 'Acceleration is the rate of change of velocity; if velocity is constant, there is no change, so acceleration is zero.'),
('physics-2024-paper-1', 'Newton''s First Law states that an object in motion stays in motion unless acted on by an external force.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True.',
 'This is the law of inertia: objects maintain their state of motion (or rest) unless an unbalanced external force acts on them.'),
('physics-2024-paper-1', 'Calculate the speed of a car that travels 150 km in 3 hours.', 'short_answer', NULL, NULL, NULL, NULL, '50 km/h', 6,
 'Award full marks for 50 km/h using speed = distance/time; partial marks for correct formula without a final answer.',
 'Speed = distance / time = 150 km / 3 h = 50 km/h.'),
('physics-2024-paper-1', 'Explain Newton''s three laws of motion, giving one real-life example for each.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct statement of each law and one relevant, correctly linked real-life example per law (up to 3 examples).',
 'Strong answers state each law precisely (inertia, F=ma, action-reaction) and pick everyday examples that clearly demonstrate that specific law.'),

-- Physics Paper 2: Electricity & Circuits
('physics-2025-paper-2', 'What is the SI unit of electric current?', 'multiple_choice', 'Volt', 'Ohm', 'Ampere', 'Watt', 'c', 4,
 'Award full marks for Ampere.',
 'Electric current is measured in amperes (A), representing the rate of flow of electric charge.'),
('physics-2025-paper-2', 'In a series circuit, if one bulb burns out, what happens to the rest?', 'multiple_choice', 'They stay lit', 'They go off too', 'They get brighter', 'Nothing changes', 'b', 4,
 'Award full marks for "they go off too".',
 'In a series circuit there is only one path for current, so a break anywhere stops current everywhere in the loop.'),
('physics-2025-paper-2', 'Resistance in a circuit opposes the flow of electric current.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True.',
 'Resistance converts some electrical energy to heat and reduces the current for a given voltage, per Ohm''s Law.'),
('physics-2025-paper-2', 'Using Ohm''s Law, calculate the voltage across a resistor of 10 ohms carrying a current of 2 amperes.', 'short_answer', NULL, NULL, NULL, NULL, '20V', 6,
 'Award full marks for 20V using V = IR; partial marks for correct formula without a final answer.',
 'V = I x R = 2A x 10 ohms = 20V.'),
('physics-2025-paper-2', 'Explain the difference between series and parallel circuits, including one advantage of each in real-world use.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct technical distinction, and one valid real-world advantage per circuit type.',
 'A strong answer explains single-path vs multiple-path current flow and links each to a practical advantage (e.g. parallel circuits keep working if one component fails).'),

-- Chemistry Paper 1: Atomic Structure & Bonding
('chemistry-2024-paper-1', 'What subatomic particle has a negative charge?', 'multiple_choice', 'Proton', 'Neutron', 'Electron', 'Nucleus', 'c', 4,
 'Award full marks for Electron.',
 'Electrons carry a negative charge and orbit the nucleus, which contains positively charged protons and neutral neutrons.'),
('chemistry-2024-paper-1', 'Which type of bond involves the transfer of electrons between atoms?', 'multiple_choice', 'Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond', 'b', 4,
 'Award full marks for Ionic bond.',
 'Ionic bonds form when electrons are transferred from one atom to another, creating oppositely charged ions that attract each other.'),
('chemistry-2024-paper-1', 'Atoms of the same element always have the same number of protons.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True -- this is the defining feature of an element (its atomic number).',
 'The number of protons (atomic number) defines what element an atom is; isotopes of the same element vary only in neutron count.'),
('chemistry-2024-paper-1', 'State the number of electrons in the outermost shell of a sodium atom (atomic number 11), and explain what this means for its reactivity.', 'short_answer', NULL, NULL, NULL, NULL, 'Sodium has 1 outer electron, making it highly reactive as it readily loses that electron to form a stable ion.', 6,
 'Award marks for correctly identifying 1 outer electron and explaining that this makes sodium highly reactive as it readily loses that electron.',
 'Sodium''s electron configuration (2,8,1) leaves a single electron in its outer shell, which is easily lost to achieve a stable, full outer shell.'),
('chemistry-2024-paper-1', 'Compare and contrast ionic and covalent bonding, including how each affects the physical properties of the resulting compounds.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct description of both bond types, at least two properties compared (e.g. melting point, conductivity), and clear linkage between bonding type and properties.',
 'Strong answers connect the mechanism (electron transfer vs sharing) directly to observed properties like melting point, solubility, and electrical conductivity.'),

-- Chemistry Paper 2: Acids, Bases & Reactions
('chemistry-2025-paper-2', 'What is the pH value of a neutral solution?', 'multiple_choice', '0', '7', '14', '10', 'b', 4,
 'Award full marks for 7.',
 'A pH of 7 is neutral; values below 7 are acidic and values above 7 are basic/alkaline.'),
('chemistry-2025-paper-2', 'Which of the following is a common indicator used to test for acids and bases?', 'multiple_choice', 'Sodium chloride', 'Litmus paper', 'Distilled water', 'Copper sulfate', 'b', 4,
 'Award full marks for Litmus paper.',
 'Litmus paper changes colour (red for acids, blue for bases) making it a simple, common acid-base indicator.'),
('chemistry-2025-paper-2', 'A base that dissolves in water is called an alkali.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True.',
 'All alkalis are bases, but only water-soluble bases are specifically called alkalis.'),
('chemistry-2025-paper-2', 'Write a word equation for the reaction between hydrochloric acid and sodium hydroxide.', 'short_answer', NULL, NULL, NULL, NULL, 'hydrochloric acid + sodium hydroxide -> sodium chloride + water', 6,
 'Award full marks for: hydrochloric acid + sodium hydroxide -> sodium chloride + water.',
 'This is a neutralisation reaction: an acid and a base react to form a salt and water.'),
('chemistry-2025-paper-2', 'Explain, using examples, how balancing chemical equations demonstrates the law of conservation of mass.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct statement of the law, a correctly balanced example equation, and clear explanation of how atom counts match on both sides.',
 'A strong answer states that mass/atoms are neither created nor destroyed, then shows a balanced equation where atom counts of each element match on both sides.'),

-- Computer Studies Paper 1: Pseudocode & Algorithms
('computer-studies-2024-paper-1', 'What does ''IF...THEN...ELSE'' represent in pseudocode?', 'multiple_choice', 'A loop', 'A selection structure', 'A variable declaration', 'An output statement', 'b', 4,
 'Award full marks for a selection structure.',
 'IF...THEN...ELSE chooses between alternative paths of execution based on a condition -- this is a selection structure.'),
('computer-studies-2024-paper-1', 'Which of the following best describes an algorithm?', 'multiple_choice', 'A programming language', 'A step-by-step procedure to solve a problem', 'A type of computer hardware', 'A database', 'b', 4,
 'Award full marks for a step-by-step procedure to solve a problem.',
 'An algorithm is a precise, ordered sequence of steps that solves a problem or completes a task, independent of any specific language.'),
('computer-studies-2024-paper-1', 'A flowchart is a visual representation of an algorithm.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True.',
 'Flowcharts use standardised shapes and arrows to represent the steps and decisions in an algorithm visually.'),
('computer-studies-2024-paper-1', 'Write pseudocode to input two numbers and output their sum.', 'short_answer', NULL, NULL, NULL, NULL, 'INPUT num1, num2; SET total = num1 + num2; OUTPUT total', 6,
 'Award marks for correct INPUT statements for both numbers, a correct sum operation, and an OUTPUT statement.',
 'The three essential steps are: read both inputs, compute their sum, then display the result -- order matters since the sum needs both values first.'),
('computer-studies-2024-paper-1', 'Explain the difference between sequence, selection, and iteration in programming, giving a simple example of each.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for correct definition of each control structure and one valid, correctly matched example per structure.',
 'Sequence runs steps in order, selection (IF) chooses between paths, and iteration (loops) repeats steps -- strong answers give a small, clearly matching example of each.'),

-- Computer Studies Paper 2: Data Representation & Programming
('computer-studies-2025-paper-2', 'What is the binary equivalent of the decimal number 5?', 'multiple_choice', '100', '101', '110', '111', 'b', 4,
 'Award full marks for 101 (4+0+1 = 5).',
 '5 in binary is 101: 1x4 + 0x2 + 1x1 = 5.'),
('computer-studies-2025-paper-2', 'Which data type would best store a value like ''True'' or ''False''?', 'multiple_choice', 'Integer', 'String', 'Boolean', 'Float', 'c', 4,
 'Award full marks for Boolean.',
 'Boolean is the data type specifically designed to hold one of exactly two values: true or false.'),
('computer-studies-2025-paper-2', 'A variable''s value can change during the execution of a program.', 'true_false', 'True', 'False', NULL, NULL, 'true', 2,
 'Award full marks for True -- that is what distinguishes a variable from a constant.',
 'Unlike constants, variables are named storage locations whose stored value can be reassigned as the program runs.'),
('computer-studies-2025-paper-2', 'Convert the decimal number 10 into its binary equivalent, showing your working.', 'short_answer', NULL, NULL, NULL, NULL, '1010', 6,
 'Award full marks for 1010, with partial marks for correct working (repeated division by 2) even if the final answer has an error.',
 '10 / 2 = 5 r0, 5 / 2 = 2 r1, 2 / 2 = 1 r0, 1 / 2 = 0 r1 -- reading remainders bottom-up gives 1010.'),
('computer-studies-2025-paper-2', 'Discuss the importance of using meaningful variable names and comments in a program, and how this affects the maintainability of code.', 'essay', NULL, NULL, NULL, NULL, NULL, 10,
 'Award marks for explanation of readability/maintainability benefits, at least one example each of variable naming and commenting, and a coherent conclusion.',
 'Strong answers contrast a poorly named example (e.g. "x") with a clear one (e.g. "studentAge"), and explain how comments help future readers (including the original author) understand intent.')

) AS q(paper_slug, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, marks, marking_scheme, ai_explanation)
JOIN past_papers pp ON pp.slug = q.paper_slug
WHERE NOT EXISTS (SELECT 1 FROM questions WHERE questions.paper_id = pp.id);
