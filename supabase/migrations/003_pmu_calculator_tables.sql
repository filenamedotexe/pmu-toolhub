-- PMU Revenue Calculator Tables Migration
-- Following existing schema patterns from 001_initial_schema.sql

-- Calculator sessions table
CREATE TABLE public.calculator_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services configuration table
CREATE TABLE public.services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.calculator_sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('one_time', 'first_session', 'touch_up', 'refresher', 'lash_extension', 'custom')),
  parent_service_id UUID REFERENCES public.services(id), -- for touch-ups/refreshers
  preference_rating INTEGER DEFAULT 3 CHECK (preference_rating >= 1 AND preference_rating <= 5),
  current_monthly_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hours of operation table
CREATE TABLE public.operating_hours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.calculator_sessions(id) ON DELETE CASCADE,
  hours_per_week DECIMAL(5,2) NOT NULL,
  hours_per_day DECIMAL(4,2),
  working_days_per_week INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated scenarios table
CREATE TABLE public.scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.calculator_sessions(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('preference_optimized', 'efficiency_optimized', 'balanced_growth')),
  target_revenue DECIMAL(10,2) NOT NULL,
  total_weekly_hours DECIMAL(5,2),
  happiness_score DECIMAL(3,2),
  scenario_data JSONB NOT NULL, -- Service booking distributions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at triggers following existing pattern
CREATE TRIGGER update_calculator_sessions_updated_at 
  BEFORE UPDATE ON public.calculator_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies following existing patterns
ALTER TABLE public.calculator_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Calculator sessions policies
CREATE POLICY "Users can view their own calculator sessions" ON public.calculator_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calculator sessions" ON public.calculator_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calculator sessions" ON public.calculator_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calculator sessions" ON public.calculator_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Services policies
CREATE POLICY "Users can view services from their sessions" ON public.services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert services to their sessions" ON public.services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update services in their sessions" ON public.services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete services from their sessions" ON public.services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Operating hours policies
CREATE POLICY "Users can view operating hours from their sessions" ON public.operating_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert operating hours to their sessions" ON public.operating_hours
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update operating hours in their sessions" ON public.operating_hours
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete operating hours from their sessions" ON public.operating_hours
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Scenarios policies
CREATE POLICY "Users can view scenarios from their sessions" ON public.scenarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scenarios to their sessions" ON public.scenarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update scenarios in their sessions" ON public.scenarios
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete scenarios from their sessions" ON public.scenarios
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.calculator_sessions 
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Admin policies for all tables (following existing pattern)
CREATE POLICY "Admins can manage all calculator sessions" ON public.calculator_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all services" ON public.services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all operating hours" ON public.operating_hours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all scenarios" ON public.scenarios
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert the PMU Revenue Calculator tool entry
INSERT INTO public.tools (name, slug, description) VALUES
('PMU Revenue Calculator', 'pmu-revenue-calculator', 'AI-powered revenue optimization for PMU artists');