-- Create profiles table for user data
-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--   username TEXT UNIQUE NOT NULL,
--   display_name TEXT,
--   avatar_url TEXT,
--   total_points INTEGER DEFAULT 0,
--   current_streak INTEGER DEFAULT 0,
--   best_streak INTEGER DEFAULT 0,
--   level TEXT DEFAULT 'Bronze',
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- INSERT INTO public.profiles (id, username, display_name, email)
-- VALUES (
--     NEW.id,
--     COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
--     COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
--     NEW.email
-- );


-- CREATE TABLE IF NOT EXISTS public.profiles (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name TEXT NOT NULL,
--   email TEXT UNIQUE NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );


CREATE TABLE IF NOT EXISTS public.form_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.form_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert form users" 
  ON public.form_users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can read form users"
  ON public.form_users FOR SELECT
  USING (true);






-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL DEFAULT 'Math',
  total_questions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes"
  ON public.quizzes FOR SELECT
  USING (true);

-- Create questions table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  order_num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  USING (true);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample quiz data
INSERT INTO public.quizzes (id, title, description, difficulty, total_questions) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Basic Arithmetic', 'Test your basic math skills with addition and subtraction', 'easy', 5),
  ('550e8400-e29b-41d4-a716-446655440002', 'Multiplication Master', 'Challenge yourself with multiplication problems', 'medium', 5),
  ('550e8400-e29b-41d4-a716-446655440003', 'Advanced Mathematics', 'Complex problems for math enthusiasts', 'hard', 5);

-- Insert sample questions
INSERT INTO public.questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_answer, order_num) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'What is 5 + 3?', '6', '7', '8', '9', 'C', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'What is 12 - 4?', '6', '7', '8', '9', 'C', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'What is 9 + 6?', '13', '14', '15', '16', 'C', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'What is 20 - 7?', '11', '12', '13', '14', 'C', 4),
  ('550e8400-e29b-41d4-a716-446655440001', 'What is 15 + 8?', '21', '22', '23', '24', 'C', 5),
  
  ('550e8400-e29b-41d4-a716-446655440002', 'What is 7 × 8?', '54', '55', '56', '57', 'C', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'What is 9 × 6?', '52', '53', '54', '55', 'C', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 'What is 12 × 5?', '58', '59', '60', '61', 'C', 3),
  ('550e8400-e29b-41d4-a716-446655440002', 'What is 8 × 9?', '70', '71', '72', '73', 'C', 4),
  ('550e8400-e29b-41d4-a716-446655440002', 'What is 11 × 7?', '75', '76', '77', '78', 'C', 5),
  
  ('550e8400-e29b-41d4-a716-446655440003', 'If Rani has 10 apples and gives 4 to her friend, how many are left?', '5', '6', '7', '8', 'B', 1),
  ('550e8400-e29b-41d4-a716-446655440003', 'What is 15% of 200?', '25', '30', '35', '40', 'B', 2),
  ('550e8400-e29b-41d4-a716-446655440003', 'Solve: 3x + 5 = 20, what is x?', '3', '4', '5', '6', 'C', 3),
  ('550e8400-e29b-41d4-a716-446655440003', 'What is the area of a rectangle with length 8 and width 6?', '42', '44', '46', '48', 'D', 4),
  ('550e8400-e29b-41d4-a716-446655440003', 'What is √144?', '10', '11', '12', '13', 'C', 5);