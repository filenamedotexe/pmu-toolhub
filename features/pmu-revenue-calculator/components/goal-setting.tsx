'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertTriangle, Wand2, DollarSign } from 'lucide-react';
import { LoadingStates } from './loading-states';
import { GoalSettingFormData } from '../types/calculator';
import { useCalculatorState } from '../hooks/use-calculator-state';
import { calculateCurrentMonthlyRevenue, calculateProjectedGrowth, formatCurrency, formatPercentage } from '../utils/calculations';

const GoalSettingSchema = z.object({
  target_revenue: z.number().min(1, "Target revenue must be greater than 0"),
  timeline: z.enum(['monthly', 'yearly'])
});

interface GoalSettingProps {
  onComplete: () => void;
  isGenerating: boolean;
}

export function GoalSetting({ onComplete, isGenerating }: GoalSettingProps) {
  const { services, goalSetting, setGoalSetting, operatingHours } = useCalculatorState();
  
  const form = useForm<GoalSettingFormData>({
    resolver: zodResolver(GoalSettingSchema),
    defaultValues: {
      target_revenue: goalSetting?.target_revenue || 0,
      timeline: goalSetting?.timeline || 'monthly'
    }
  });

  const currentRevenue = calculateCurrentMonthlyRevenue(services);
  const targetRevenue = form.watch('target_revenue');
  const timeline = form.watch('timeline');
  
  const adjustedTargetRevenue = timeline === 'yearly' ? targetRevenue / 12 : targetRevenue;
  const growth = calculateProjectedGrowth(currentRevenue, adjustedTargetRevenue);

  const onSubmit = (data: GoalSettingFormData) => {
    const adjustedData = {
      ...data,
      target_revenue: data.timeline === 'yearly' ? data.target_revenue / 12 : data.target_revenue
    };
    setGoalSetting(adjustedData);
    onComplete();
  };

  const suggestedTargets = [
    { label: '25% Growth', value: Math.round(currentRevenue * 1.25) },
    { label: '50% Growth', value: Math.round(currentRevenue * 1.5) },
    { label: '75% Growth', value: Math.round(currentRevenue * 1.75) },
    { label: '100% Growth', value: Math.round(currentRevenue * 2) }
  ].filter(target => target.value > currentRevenue);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Set Your Revenue Goals</h3>
        <p className="text-muted-foreground">
          Define your target revenue to generate personalized growth scenarios.
        </p>
      </div>

      {/* Current vs Target Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Monthly Revenue:</span>
              <span className="text-lg font-semibold">{formatCurrency(currentRevenue)}</span>
            </div>
            
            {targetRevenue > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Target {timeline === 'yearly' ? 'Annual' : 'Monthly'} Revenue:</span>
                  <span className="text-lg font-semibold text-primary">{formatCurrency(targetRevenue)}</span>
                </div>
                
                {timeline === 'yearly' && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Target Monthly Revenue:</span>
                    <span className="text-lg font-semibold text-primary">{formatCurrency(adjustedTargetRevenue)}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Growth needed:</span>
                    <span className={`font-medium ${
                      growth.growthPercentage > 200 ? 'text-red-600' : 
                      growth.growthPercentage > 100 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(growth.growthAmount)} ({formatPercentage(growth.growthPercentage)})
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((adjustedTargetRevenue / currentRevenue) * 50, 100)} 
                    className="h-2"
                  />
                </div>

                {!growth.isRealistic && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      This target represents {formatPercentage(growth.growthPercentage)} growth. Consider setting intermediate milestones.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Goal Setting Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Revenue Target
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target_revenue">Target Revenue</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="target_revenue"
                    type="number"
                    min="1"
                    step="100"
                    {...form.register('target_revenue', { valueAsNumber: true })}
                    placeholder="5000"
                    className="pl-10"
                  />
                </div>
                {form.formState.errors.target_revenue && (
                  <p className="text-sm text-destructive">{form.formState.errors.target_revenue.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeline">Timeline</Label>
                <select
                  {...form.register('timeline')}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="monthly">Monthly Target</option>
                  <option value="yearly">Annual Target</option>
                </select>
              </div>
            </div>

            {/* Quick Target Suggestions */}
            {currentRevenue > 0 && suggestedTargets.length > 0 && (
              <div className="space-y-3">
                <Label>Quick Target Options:</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  {suggestedTargets.map((target) => (
                    <Button
                      key={target.label}
                      type="button"
                      variant="outline"
                      className="justify-between h-auto py-3"
                      onClick={() => form.setValue('target_revenue', timeline === 'yearly' ? target.value * 12 : target.value)}
                    >
                      <span className="font-medium">{target.label}</span>
                      <span className="text-muted-foreground">
                        {timeline === 'yearly' ? formatCurrency(target.value * 12) : formatCurrency(target.value)}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!targetRevenue || targetRevenue <= 0 || isGenerating}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating Scenarios...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate AI Scenarios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Goal Setting Tips */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <h5 className="font-medium text-foreground">Goal Setting Tips:</h5>
            <ul className="space-y-1 ml-4">
              <li><strong>Realistic targets:</strong> 25-75% growth is typically achievable</li>
              <li><strong>Consider capacity:</strong> Ensure you have hours available for growth</li>
              <li><strong>Market factors:</strong> Account for seasonal demand and competition</li>
              <li><strong>Progressive goals:</strong> Set milestones rather than huge jumps</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}