'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { OperatingHoursFormData } from '../types/calculator';
import { useCalculatorState } from '../hooks/use-calculator-state';
import { calculateTotalCurrentWeeklyHours } from '../utils/calculations';

const OperatingHoursSchema = z.object({
  hours_per_week: z.number().min(1, "Must work at least 1 hour per week").max(168, "Cannot exceed 168 hours per week"),
  hours_per_day: z.number().min(1, "Must work at least 1 hour per day").max(24, "Cannot exceed 24 hours per day").optional(),
  working_days_per_week: z.number().min(1, "Must work at least 1 day").max(7, "Cannot exceed 7 days")
});

export function OperatingHours() {
  const { services, operatingHours, saveOperatingHours, isLoading } = useCalculatorState();
  
  const form = useForm<OperatingHoursFormData>({
    resolver: zodResolver(OperatingHoursSchema),
    defaultValues: {
      hours_per_week: operatingHours?.hours_per_week || 40,
      hours_per_day: operatingHours?.hours_per_day || undefined,
      working_days_per_week: operatingHours?.working_days_per_week || 5
    }
  });

  const hoursPerWeek = form.watch('hours_per_week');
  const hoursPerDay = form.watch('hours_per_day');
  const workingDays = form.watch('working_days_per_week');

  const currentWeeklyHours = calculateTotalCurrentWeeklyHours(services);
  const utilizationRate = hoursPerWeek > 0 ? (currentWeeklyHours / hoursPerWeek) * 100 : 0;
  const averageHoursPerDay = hoursPerWeek / workingDays;

  const onSubmit = async (data: OperatingHoursFormData) => {
    await saveOperatingHours(data);
  };

  const getUtilizationColor = () => {
    if (utilizationRate > 100) return 'destructive';
    if (utilizationRate > 80) return 'warning';
    return 'default';
  };

  const getUtilizationStatus = () => {
    if (utilizationRate > 100) return 'Over capacity';
    if (utilizationRate > 80) return 'High utilization';
    if (utilizationRate > 50) return 'Good utilization';
    return 'Low utilization';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Set Your Operating Hours</h3>
        <p className="text-muted-foreground">
          Define your working schedule to calculate capacity and optimize bookings.
        </p>
      </div>

      {/* Current Usage Overview */}
      {services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Current Capacity Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Current weekly hours from services:</span>
                <span className="font-medium">{currentWeeklyHours.toFixed(1)}h</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Capacity utilization:</span>
                  <span className={`font-medium ${
                    utilizationRate > 100 ? 'text-destructive' : 
                    utilizationRate > 80 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {utilizationRate.toFixed(0)}% " {getUtilizationStatus()}
                  </span>
                </div>
                <Progress 
                  value={Math.min(utilizationRate, 100)} 
                  className={`h-2 ${getUtilizationColor()}`}
                />
              </div>

              {utilizationRate > 100 && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">
                    Your current bookings exceed your available hours. Consider increasing your capacity.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Operating Hours Form */}
      <Card>
        <CardHeader>
          <CardTitle>Working Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hours_per_week">Total Hours Per Week</Label>
                <Input
                  id="hours_per_week"
                  type="number"
                  min="1"
                  max="168"
                  step="0.5"
                  {...form.register('hours_per_week', { valueAsNumber: true })}
                  placeholder="40"
                />
                {form.formState.errors.hours_per_week && (
                  <p className="text-sm text-destructive">{form.formState.errors.hours_per_week.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: 20-50 hours for sustainable work-life balance
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="working_days_per_week">Working Days Per Week</Label>
                <select
                  id="working_days_per_week"
                  {...form.register('working_days_per_week', { valueAsNumber: true })}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                  <option value="4">4 days</option>
                  <option value="5" selected>5 days</option>
                  <option value="6">6 days</option>
                  <option value="7">7 days</option>
                </select>
                {form.formState.errors.working_days_per_week && (
                  <p className="text-sm text-destructive">{form.formState.errors.working_days_per_week.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hours_per_day">
                  Average Hours Per Day 
                  <span className="text-muted-foreground font-normal"> (optional)</span>
                </Label>
                <Input
                  id="hours_per_day"
                  type="number"
                  min="1"
                  max="24"
                  step="0.5"
                  {...form.register('hours_per_day', { valueAsNumber: true })}
                  placeholder={averageHoursPerDay.toFixed(1)}
                />
                {form.formState.errors.hours_per_day && (
                  <p className="text-sm text-destructive">{form.formState.errors.hours_per_day.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Average: {averageHoursPerDay.toFixed(1)} hours/day based on weekly total
                </p>
              </div>

              <div className="space-y-2">
                <Label>Schedule Summary</Label>
                <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Weekly hours:</span>
                    <span className="font-medium">{hoursPerWeek}h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Working days:</span>
                    <span className="font-medium">{workingDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg hours/day:</span>
                    <span className="font-medium">{averageHoursPerDay.toFixed(1)}h</span>
                  </div>
                  {hoursPerDay && (
                    <div className="flex justify-between">
                      <span>Set hours/day:</span>
                      <span className="font-medium">{hoursPerDay}h</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className={`${hoursPerWeek > 50 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    {hoursPerWeek > 50 ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                    <span className={`text-sm font-medium ${hoursPerWeek > 50 ? 'text-yellow-800' : 'text-green-800'}`}>
                      {hoursPerWeek > 50 ? 'High workload detected' : 'Healthy work schedule'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${hoursPerWeek > 50 ? 'text-yellow-700' : 'text-green-700'}`}>
                    {hoursPerWeek > 50 
                      ? 'Consider reducing hours for better work-life balance'
                      : 'Your schedule allows for sustainable growth'
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Available capacity
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-blue-700">
                    {currentWeeklyHours < hoursPerWeek 
                      ? `${(hoursPerWeek - currentWeeklyHours).toFixed(1)}h available for growth`
                      : 'At full capacity - consider optimizing service mix'
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {operatingHours ? 'Update Hours' : 'Save Hours'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <h5 className="font-medium text-foreground">Working Hours Guidelines:</h5>
            <ul className="space-y-1 ml-4">
              <li><strong>20-35 hours/week:</strong> Part-time, allows for other commitments</li>
              <li><strong>35-45 hours/week:</strong> Full-time, sustainable long-term</li>
              <li><strong>45-55 hours/week:</strong> High productivity, monitor burnout</li>
              <li><strong>55+ hours/week:</strong> Unsustainable long-term, consider scaling</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}