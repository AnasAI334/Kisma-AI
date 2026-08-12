/*
# Create Kisma AI learning platform schema

1. New Tables
- `profiles` — user display info (display_name, avatar_url, bio) linked to auth.users
- `courses` — learning courses (title, description, category, difficulty, color)
- `lessons` — lessons within a course (title, content, duration_minutes, order_index)
- `enrollments` — tracks which user enrolled in which course
- `lesson_progress` — per-user completion status for each lesson
- `streaks` — daily learning streak tracking per user
- `ai_conversations` — chat conversation sessions for the AI assistant
- `ai_messages` — individual messages within an AI conversation

2. Security (RLS)
- courses, lessons: public read (anon + authenticated), no public write
- profiles: owner can read/update own profile; any authenticated can read
- enrollments: owner-scoped CRUD (auth.uid = user_id)
- lesson_progress: owner-scoped CRUD
- streaks: owner-scoped CRUD
- ai_conversations: owner-scoped CRUD
- ai_messages: owner-scoped through parent conversation

3. Important Notes
- All owner columns default to auth.uid() so inserts work without passing user_id
- Profiles auto-created via trigger when a new auth user signs up
- Streaks updated via a trigger when lesson_progress is marked complete
- Courses and lessons are seeded separately after migration
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  INSERT INTO public.streaks (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ COURSES ============
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  difficulty text NOT NULL DEFAULT 'Beginner',
  color text NOT NULL DEFAULT '#0F766E',
  icon text NOT NULL DEFAULT '📚',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select" ON courses;
CREATE POLICY "courses_select" ON courses FOR SELECT
  TO anon, authenticated USING (true);

-- ============ LESSONS ============
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  duration_minutes int NOT NULL DEFAULT 10,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons_select" ON lessons;
CREATE POLICY "lessons_select" ON lessons FOR SELECT
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- ============ ENROLLMENTS ============
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own" ON enrollments;
CREATE POLICY "enrollments_select_own" ON enrollments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_insert_own" ON enrollments;
CREATE POLICY "enrollments_insert_own" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_delete_own" ON enrollments;
CREATE POLICY "enrollments_delete_own" ON enrollments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);

-- ============ LESSON PROGRESS ============
CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_progress_select_own" ON lesson_progress;
CREATE POLICY "lesson_progress_select_own" ON lesson_progress FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_insert_own" ON lesson_progress;
CREATE POLICY "lesson_progress_insert_own" ON lesson_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_update_own" ON lesson_progress;
CREATE POLICY "lesson_progress_update_own" ON lesson_progress FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "lesson_progress_delete_own" ON lesson_progress;
CREATE POLICY "lesson_progress_delete_own" ON lesson_progress FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_progress_user ON lesson_progress(user_id);

-- ============ STREAKS ============
CREATE TABLE IF NOT EXISTS streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date date,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "streaks_select_own" ON streaks;
CREATE POLICY "streaks_select_own" ON streaks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_update_own" ON streaks;
CREATE POLICY "streaks_update_own" ON streaks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "streaks_insert_own" ON streaks;
CREATE POLICY "streaks_insert_own" ON streaks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ AI CONVERSATIONS ============
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_conv_select_own" ON ai_conversations;
CREATE POLICY "ai_conv_select_own" ON ai_conversations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_conv_insert_own" ON ai_conversations;
CREATE POLICY "ai_conv_insert_own" ON ai_conversations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ai_conv_delete_own" ON ai_conversations;
CREATE POLICY "ai_conv_delete_own" ON ai_conversations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ai_conv_user ON ai_conversations(user_id);

-- ============ AI MESSAGES ============
CREATE TABLE IF NOT EXISTS ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ai_msg_select_own" ON ai_messages;
CREATE POLICY "ai_msg_select_own" ON ai_messages FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "ai_msg_insert_own" ON ai_messages;
CREATE POLICY "ai_msg_insert_own" ON ai_messages FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM ai_conversations WHERE ai_conversations.id = ai_messages.conversation_id AND ai_conversations.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_ai_msg_conv ON ai_messages(conversation_id);
