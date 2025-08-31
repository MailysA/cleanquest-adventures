-- Enable RLS and create policies for user_tasks table
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tasks
CREATE POLICY "Users can view own tasks" ON public.user_tasks
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only insert their own tasks
CREATE POLICY "Users can insert own tasks" ON public.user_tasks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can only update their own tasks
CREATE POLICY "Users can update own tasks" ON public.user_tasks
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" ON public.user_tasks
    FOR DELETE USING (auth.uid()::text = user_id);

-- Enable RLS and create policies for user_badges table
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Users can only view their own badges
CREATE POLICY "Users can view own badges" ON public.user_badges
    FOR SELECT USING (auth.uid()::text = user_id);

-- Users can only insert their own badges
CREATE POLICY "Users can insert own badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Users can only update their own badges
CREATE POLICY "Users can update own badges" ON public.user_badges
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Enable RLS for task_templates (global templates - everyone can read)
ALTER TABLE public.task_templates ENABLE ROW LEVEL SECURITY;

-- Everyone can read task templates (they are global)
CREATE POLICY "Anyone can view task templates" ON public.task_templates
    FOR SELECT USING (true);

-- Only authenticated users can insert/update templates (if needed)
CREATE POLICY "Authenticated users can manage templates" ON public.task_templates
    FOR ALL USING (auth.role() = 'authenticated');