import { z } from 'zod';

// Service validation schema
export const ServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  price: z.number().min(0.01, "Price must be greater than 0").max(10000, "Price seems unreasonably high"),
  duration_minutes: z.number().min(1, "Duration is required").max(480, "Duration cannot exceed 8 hours"),
  service_type: z.enum(['one_time', 'first_session', 'touch_up', 'refresher', 'lash_extension', 'custom']),
  parent_service_id: z.string().optional(),
  preference_rating: z.number().min(1).max(5).default(3),
  current_monthly_bookings: z.number().min(0).max(500).default(0)
});

// Operating hours validation schema
export const OperatingHoursSchema = z.object({
  hours_per_week: z.number().min(1, "Must work at least 1 hour per week").max(80, "Working more than 80 hours per week is not sustainable"),
  hours_per_day: z.number().min(1).max(16).optional(),
  working_days_per_week: z.number().min(1, "Must work at least 1 day per week").max(7).default(5)
}).refine((data) => {
  // Validate that daily hours * working days doesn't exceed weekly hours
  if (data.hours_per_day && data.working_days_per_week) {
    return data.hours_per_day * data.working_days_per_week <= data.hours_per_week + 5; // Allow some flexibility
  }
  return true;
}, {
  message: "Daily hours multiplied by working days cannot significantly exceed weekly hours"
});

// Goal setting validation schema
export const GoalSettingSchema = z.object({
  target_revenue: z.number().min(100, "Revenue goal must be at least $100").max(100000, "Revenue goal seems unreasonably high"),
  timeline: z.enum(['monthly', 'yearly']).default('monthly')
});

// Calculator session validation schema
export const CalculatorSessionSchema = z.object({
  name: z.string().min(1, "Session name is required").max(255, "Session name too long").optional(),
  status: z.enum(['draft', 'completed']).default('draft')
});

// Validation helper functions
export const validateServiceDependency = (services: Array<{ id: string; service_type: string }>, newService: { service_type: string; parent_service_id?: string }) => {
  // Touch-ups and refreshers must have a parent service
  if (['touch_up', 'refresher'].includes(newService.service_type)) {
    if (!newService.parent_service_id) {
      return { isValid: false, error: "Touch-ups and refreshers must have a parent service" };
    }
    
    // Check if parent service exists and is a first_session
    const parentService = services.find(s => s.id === newService.parent_service_id);
    if (!parentService) {
      return { isValid: false, error: "Parent service not found" };
    }
    
    if (parentService.service_type !== 'first_session') {
      return { isValid: false, error: "Parent service must be a first session" };
    }
  }
  
  return { isValid: true, error: null };
};

export const validateRevenueGoal = (currentRevenue: number, targetRevenue: number) => {
  const growthPercentage = ((targetRevenue - currentRevenue) / currentRevenue) * 100;
  
  if (targetRevenue <= currentRevenue) {
    return { 
      isValid: false, 
      error: "Target revenue must be higher than current revenue",
      growthPercentage: 0
    };
  }
  
  if (growthPercentage > 200) {
    return {
      isValid: true,
      error: null,
      warning: "Growth target is very ambitious (>200%). Consider a more gradual approach.",
      growthPercentage
    };
  }
  
  return { isValid: true, error: null, growthPercentage };
};

export const validateWorkloadSustainability = (weeklyHours: number, targetRevenue: number, currentRevenue: number) => {
  const revenuePerHour = targetRevenue / (weeklyHours * 4.33); // Average weeks per month
  const growthFactor = targetRevenue / currentRevenue;
  
  const warnings: string[] = [];
  
  if (weeklyHours > 50) {
    warnings.push("Working over 50 hours per week may lead to burnout");
  }
  
  if (revenuePerHour < 50) {
    warnings.push("Revenue per hour seems low. Consider raising prices.");
  }
  
  if (growthFactor > 2 && weeklyHours > 40) {
    warnings.push("Doubling revenue while working full-time may be challenging");
  }
  
  return {
    revenuePerHour,
    warnings,
    isRealistic: warnings.length === 0
  };
};