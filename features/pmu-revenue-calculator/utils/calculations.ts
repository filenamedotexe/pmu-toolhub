import { Service, OperatingHours, ScenarioData } from '../types/calculator';

export function calculateCurrentMonthlyRevenue(services: Service[]): number {
  return services.reduce((total, service) => {
    return total + (service.price * service.current_monthly_bookings);
  }, 0);
}

export function calculateTotalCurrentWeeklyHours(services: Service[]): number {
  const totalMinutesPerWeek = services.reduce((total, service) => {
    const minutesPerMonth = service.duration_minutes * service.current_monthly_bookings;
    const minutesPerWeek = minutesPerMonth / 4.33; // Average weeks per month
    return total + minutesPerWeek;
  }, 0);
  
  return Math.round(totalMinutesPerWeek / 60 * 100) / 100; // Convert to hours, round to 2 decimals
}

export function calculateRevenuePerHour(revenue: number, hours: number): number {
  if (hours === 0) return 0;
  return Math.round((revenue / hours) * 100) / 100;
}

export function calculateCapacityUtilization(currentHours: number, maxHours: number): number {
  if (maxHours === 0) return 0;
  return Math.round((currentHours / maxHours) * 100);
}

export function validateServiceDependencies(services: Service[]): string[] {
  const errors: string[] = [];
  const firstSessionServices = services.filter(s => s.service_type === 'first_session');
  
  services.forEach(service => {
    if (service.service_type === 'touch_up' || service.service_type === 'refresher') {
      if (!service.parent_service_id) {
        errors.push(`${service.name} requires a parent service selection`);
      } else {
        const parentExists = services.some(s => s.id === service.parent_service_id);
        if (!parentExists) {
          errors.push(`Parent service not found for ${service.name}`);
        }
      }
    }
  });
  
  return errors;
}

export function calculateProjectedGrowth(currentRevenue: number, targetRevenue: number): {
  growthAmount: number;
  growthPercentage: number;
  isRealistic: boolean;
} {
  const growthAmount = targetRevenue - currentRevenue;
  const growthPercentage = currentRevenue > 0 ? (growthAmount / currentRevenue) * 100 : 0;
  const isRealistic = growthPercentage <= 200; // Flag if growth > 200%
  
  return {
    growthAmount: Math.round(growthAmount * 100) / 100,
    growthPercentage: Math.round(growthPercentage * 100) / 100,
    isRealistic
  };
}

export function generateScenarioSummary(scenarioData: ScenarioData): {
  totalMonthlyBookings: number;
  averageServicePrice: number;
  highestRevenueService: string;
  efficiencyScore: number;
} {
  const totalBookings = scenarioData.services.reduce((sum, s) => sum + s.monthly_bookings, 0);
  const totalRevenue = scenarioData.services.reduce((sum, s) => sum + s.revenue_contribution, 0);
  const averagePrice = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  
  const highestRevenueService = scenarioData.services.reduce((highest, current) => 
    current.revenue_contribution > highest.revenue_contribution ? current : highest
  ).service_name;
  
  const efficiencyScore = scenarioData.summary.revenue_per_hour / 100; // Normalize to 0-5 scale
  
  return {
    totalMonthlyBookings: totalBookings,
    averageServicePrice: Math.round(averagePrice * 100) / 100,
    highestRevenueService,
    efficiencyScore: Math.min(5, Math.round(efficiencyScore * 100) / 100)
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatHours(hours: number): string {
  if (hours < 1) {
    return `${Math.round(hours * 60)}min`;
  }
  return `${hours}h`;
}

export function formatPercentage(percentage: number): string {
  return `${Math.round(percentage)}%`;
}