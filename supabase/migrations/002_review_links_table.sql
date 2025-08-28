-- Create review_links table for storing review link generator data
CREATE TABLE public.review_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  gmb_business_name TEXT,
  gmb_place_id TEXT,
  gmb_review_link TEXT,
  gmb_completed BOOLEAN DEFAULT FALSE,
  facebook_page_name TEXT,
  facebook_review_link TEXT,
  facebook_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add updated_at trigger for review_links
CREATE TRIGGER update_review_links_updated_at 
  BEFORE UPDATE ON public.review_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on review_links table
ALTER TABLE public.review_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for review_links
CREATE POLICY "Users can view their own review links" ON public.review_links
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review links" ON public.review_links
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review links" ON public.review_links
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all review links" ON public.review_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );