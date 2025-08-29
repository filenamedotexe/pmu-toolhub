// PMU Revenue Calculator Types

export interface CalculatorSession {
  id: string;
  user_id: string;
  name?: string;
  status: 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}

export type ServiceType = 'one_time' | 'first_session' | 'touch_up' | 'refresher' | 'lash_extension' | 'custom';

export interface Service {
  id: string;
  session_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  service_type: ServiceType;
  parent_service_id?: string;
  preference_rating: number; // 1-5
  current_monthly_bookings: number;
  created_at: string;
}

export interface OperatingHours {
  id: string;
  session_id: string;
  hours_per_week: number;
  hours_per_day?: number;
  working_days_per_week: number;
  created_at: string;
}

export interface Scenario {
  id: string;
  session_id: string;
  name: string;
  type: 'preference_optimized' | 'efficiency_optimized' | 'balanced_growth';
  target_revenue: number;
  total_weekly_hours?: number;
  happiness_score?: number;
  scenario_data: ScenarioData;
  created_at: string;
}

export interface ScenarioData {
  services: ScenarioService[];
  summary: {
    monthly_revenue: number;
    weekly_hours: number;
    revenue_per_hour: number;
    happiness_score: number;
  };
}

export interface ScenarioService {
  service_id: string;
  service_name: string;
  monthly_bookings: number;
  revenue_contribution: number;
  hours_contribution: number;
}

// Form data interfaces for the multi-step calculator
export interface ServiceFormData {
  name: string;
  price: number;
  duration_minutes: number;
  service_type: ServiceType;
  parent_service_id?: string;
  preference_rating: number;
  current_monthly_bookings: number;
}

export interface OperatingHoursFormData {
  hours_per_week: number;
  hours_per_day?: number;
  working_days_per_week: number;
}

export interface GoalSettingFormData {
  target_revenue: number;
  timeline: 'monthly' | 'yearly';
}

// Calculator step enum
export enum CalculatorStep {
  SERVICE_CONFIGURATION = 1,
  OPERATING_HOURS = 2,
  REVENUE_ASSESSMENT = 3,
  PREFERENCE_RATING = 4,
  GOAL_SETTING = 5,
  SCENARIO_RESULTS = 6
}

// Calculator state interface
export interface CalculatorState {
  currentStep: CalculatorStep;
  session: CalculatorSession | null;
  services: Service[];
  operatingHours: OperatingHours | null;
  goalSetting: GoalSettingFormData | null;
  scenarios: Scenario[];
  isLoading: boolean;
  error: string | null;
}

// API interfaces
export interface GenerateScenariosRequest {
  session_id: string;
  target_revenue: number;
}

export interface GenerateScenariosResponse {
  scenarios: Scenario[];
}

// Common PMU service templates
export const PMU_SERVICE_TEMPLATES: Partial<ServiceFormData>[] = [
  {
    name: 'Microblading First Session',
    service_type: 'first_session',
    price: 400,
    duration_minutes: 180,
    preference_rating: 4
  },
  {
    name: 'Microblading Touch-up',
    service_type: 'touch_up',
    price: 150,
    duration_minutes: 90,
    preference_rating: 3
  },
  {
    name: 'Powder Brow First Session',
    service_type: 'first_session',
    price: 450,
    duration_minutes: 180,
    preference_rating: 4
  },
  {
    name: 'Lash Extension First Session',
    service_type: 'lash_extension',
    price: 120,
    duration_minutes: 120,
    preference_rating: 3
  },
  {
    name: 'Lash Fill',
    service_type: 'touch_up',
    price: 60,
    duration_minutes: 60,
    preference_rating: 3
  },
  {
    name: 'Lip Blush First Session',
    service_type: 'first_session',
    price: 500,
    duration_minutes: 180,
    preference_rating: 5
  }
];