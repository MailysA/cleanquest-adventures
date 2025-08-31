-- Drop existing policies for user_profiles to recreate more secure ones
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Create more secure RLS policies for user_profiles
-- Only authenticated users can view their own profile data
CREATE POLICY "Users can view only their own profile" ON public.user_profiles
    FOR SELECT 
    TO authenticated
    USING (auth.uid()::text = user_id);

-- Only authenticated users can insert their own profile
CREATE POLICY "Users can insert only their own profile" ON public.user_profiles
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

-- Only authenticated users can update their own profile
CREATE POLICY "Users can update only their own profile" ON public.user_profiles
    FOR UPDATE 
    TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Prevent profile deletion for data integrity (optional - remove if deletion needed)
-- CREATE POLICY "Prevent profile deletion" ON public.user_profiles
--     FOR DELETE 
--     TO authenticated
--     USING (false);

-- Verify RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;