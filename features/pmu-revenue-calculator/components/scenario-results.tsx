'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Star, Clock, DollarSign, TrendingUp, Download, RotateCcw, Wand2 } from 'lucide-react';
import { useCalculatorState } from '../hooks/use-calculator-state';
import { formatCurrency, formatHours, formatPercentage } from '../utils/calculations';

function ScenarioCard({ scenario, rank }: { scenario: any; rank: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'preference_optimized': return 'default';
      case 'efficiency_optimized': return 'secondary';
      case 'balanced_growth': return 'outline';
      default: return 'secondary';
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'preference_optimized': return 'Happiness Focused';
      case 'efficiency_optimized': return 'Efficiency Focused';
      case 'balanced_growth': return 'Balanced Growth';
      default: return type;
    }
  };
  
  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'preference_optimized': return 'Maximizes your favorite services for work satisfaction';
      case 'efficiency_optimized': return 'Optimizes for highest revenue per hour worked';
      case 'balanced_growth': return 'Balanced approach across all services and preferences';
      default: return '';
    }
  };

  return (
    <Card className={`relative ${rank === 1 ? 'ring-2 ring-primary' : ''}`}>
      {rank === 1 && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary">( Recommended</Badge>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {scenario.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getBadgeVariant(scenario.type)}>
                {getTypeLabel(scenario.type)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                #{rank} scenario
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(scenario.target_revenue)}
            </p>
            <p className="text-sm text-muted-foreground">monthly</p>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">
          {getTypeDescription(scenario.type)}
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Weekly Hours
              </div>
              <p className="font-semibold">{scenario.total_weekly_hours?.toFixed(1) || 'N/A'}h</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Revenue/Hour
              </div>
              <p className="font-semibold">
                {scenario.total_weekly_hours 
                  ? formatCurrency(scenario.target_revenue / (scenario.total_weekly_hours * 4.33))
                  : 'N/A'
                }
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4" />
                Happiness Score
              </div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">{scenario.happiness_score?.toFixed(1) || 'N/A'}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= (scenario.happiness_score || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
          {isExpanded && scenario.scenario_data?.services && (
            <div className="space-y-3">
              <h5 className="font-medium text-sm">Service Breakdown:</h5>
              <div className="space-y-2">
                {scenario.scenario_data.services.map((service: any, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>{service.service_name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {service.monthly_bookings} bookings
                      </span>
                      <span className="font-medium">
                        {formatCurrency(service.revenue_contribution)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show Less' : 'Show Details'}
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScenarioResults() {
  const { scenarios, services, goalSetting, session } = useCalculatorState();
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const regenerateScenarios = async () => {
    if (!session?.id || !goalSetting) return;
    
    setIsRegenerating(true);
    
    try {
      const response = await fetch('/api/generate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          target_revenue: goalSetting.target_revenue
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate scenarios');
      }
      
      // Scenarios will be updated via the hook
    } catch (error) {
      console.error('Error regenerating scenarios:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
        <div>
          <h4 className="font-medium">No Scenarios Generated Yet</h4>
          <p className="text-sm text-muted-foreground">Complete the previous steps to generate AI scenarios.</p>
        </div>
        <Button variant="outline" onClick={regenerateScenarios} disabled={isRegenerating}>
          <Wand2 className="h-4 w-4 mr-2" />
          Generate Scenarios
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Your AI-Generated Scenarios</h3>
        <p className="text-muted-foreground">
          Three personalized strategies to reach your revenue goals.
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Generated {scenarios.length} scenarios for {formatCurrency(goalSetting?.target_revenue || 0)} target
        </div>
        
        <Button
          variant="outline"
          onClick={regenerateScenarios}
          disabled={isRegenerating}
          className="flex items-center gap-2"
        >
          {isRegenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              Regenerating...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      {/* Scenario Cards */}
      <div className="space-y-4">
        {scenarios
          .sort((a, b) => {
            // Sort by happiness score or revenue, prioritizing balanced scenarios
            const aScore = (a.happiness_score || 0) + (a.target_revenue / 10000);
            const bScore = (b.happiness_score || 0) + (b.target_revenue / 10000);
            return bScore - aScore;
          })
          .map((scenario, index) => (
            <ScenarioCard key={scenario.id} scenario={scenario} rank={index + 1} />
          ))}
      </div>

      {/* Summary Insights */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">Next Steps:</strong> Choose the scenario that best fits your goals and start implementing the recommended booking targets.
            </p>
            <p>
              <strong className="text-foreground">Implementation:</strong> Focus on marketing the high-priority services and optimizing your booking calendar.
            </p>
            <p>
              <strong className="text-foreground">Monitoring:</strong> Track your progress monthly and adjust strategies based on actual performance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}