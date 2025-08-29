'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToolLayout } from '../shared';
import { Tool } from '@/lib/tools';
import { CalculatorStep } from './types/calculator';
import { useCalculatorState } from './hooks/use-calculator-state';
import { ServiceConfiguration } from './components/service-configuration';
import { OperatingHours } from './components/operating-hours';
import { RevenueAssessment } from './components/revenue-assessment';
import { PreferenceRating } from './components/preference-rating';
import { GoalSetting } from './components/goal-setting';
import { ScenarioResults } from './components/scenario-results';
import { ErrorBoundary } from './components/error-boundary';

const CALCULATOR_STEPS = [
  { id: CalculatorStep.SERVICE_CONFIGURATION, title: 'Services', description: 'Configure your PMU services' },
  { id: CalculatorStep.OPERATING_HOURS, title: 'Hours', description: 'Set working schedule' },
  { id: CalculatorStep.REVENUE_ASSESSMENT, title: 'Revenue', description: 'Current revenue data' },
  { id: CalculatorStep.PREFERENCE_RATING, title: 'Preferences', description: 'Rate service preferences' },
  { id: CalculatorStep.GOAL_SETTING, title: 'Goals', description: 'Set revenue targets' },
  { id: CalculatorStep.SCENARIO_RESULTS, title: 'Results', description: 'AI scenarios' }
];

interface PMURevenueCalculatorToolProps {
  tool: Tool;
}

export function PMURevenueCalculatorTool({ tool }: PMURevenueCalculatorToolProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const calculatorState = useCalculatorState(sessionId || undefined);
  const {
    currentStep,
    session,
    services,
    operatingHours,
    goalSetting,
    isLoading,
    error,
    createSession,
    goToStep,
    nextStep,
    prevStep,
    clearError
  } = calculatorState;

  const [isGeneratingScenarios, setIsGeneratingScenarios] = useState(false);

  // Helper functions
  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case CalculatorStep.SERVICE_CONFIGURATION:
        return services.length > 0;
      case CalculatorStep.OPERATING_HOURS:
        return operatingHours !== null;
      case CalculatorStep.REVENUE_ASSESSMENT:
        return services.some(s => s.current_monthly_bookings > 0);
      case CalculatorStep.PREFERENCE_RATING:
        return services.every(s => s.preference_rating > 0);
      case CalculatorStep.GOAL_SETTING:
        return goalSetting !== null && goalSetting.target_revenue > 0;
      default:
        return true;
    }
  }, [currentStep, services, operatingHours, goalSetting]);

  const generateScenarios = useCallback(async () => {
    if (!session?.id || !goalSetting) return;
    
    setIsGeneratingScenarios(true);
    
    try {
      const response = await fetch('/api/generate-scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session.id,
          target_revenue: goalSetting.target_revenue
        })
      });
      
      if (!response.ok) throw new Error('Failed to generate scenarios');
      
      await response.json();
      goToStep(CalculatorStep.SCENARIO_RESULTS);
    } catch (error) {
      console.error('Error generating scenarios:', error);
    } finally {
      setIsGeneratingScenarios(false);
    }
  }, [session?.id, goalSetting, goToStep]);

  // Session initialization
  useEffect(() => {
    if (!sessionId && !session && !isLoading) {
      createSession().then((newSessionId) => {
        if (newSessionId) {
          router.replace(`/tool/pmu-revenue-calculator?session=${newSessionId}`);
        }
      });
    }
  }, [sessionId, session, isLoading, createSession, router]);

  // Progress calculation
  const progress = ((currentStep - 1) / (CALCULATOR_STEPS.length - 1)) * 100;
  const currentStepInfo = CALCULATOR_STEPS.find(s => s.id === currentStep);

  // Step content renderer
  const renderStepContent = () => {
    const props = { ...calculatorState, generateScenarios, isGeneratingScenarios };
    
    switch (currentStep) {
      case CalculatorStep.SERVICE_CONFIGURATION:
        return <ServiceConfiguration />;
      case CalculatorStep.OPERATING_HOURS:
        return <OperatingHours />;
      case CalculatorStep.REVENUE_ASSESSMENT:
        return <RevenueAssessment />;
      case CalculatorStep.PREFERENCE_RATING:
        return <PreferenceRating />;
      case CalculatorStep.GOAL_SETTING:
        return <GoalSetting onComplete={generateScenarios} isGenerating={isGeneratingScenarios} />;
      case CalculatorStep.SCENARIO_RESULTS:
        return <ScenarioResults />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading && !session) {
    return (
      <ToolLayout tool={tool}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground">Initializing calculator...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout tool={tool}>
      <ErrorBoundary>
        {/* Header with Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>PMU Revenue Calculator</CardTitle>
                <CardDescription>
                  {currentStepInfo?.title} - {currentStepInfo?.description}
                </CardDescription>
              </div>
              <Badge variant="outline">
                Step {currentStep}/{CALCULATOR_STEPS.length}
              </Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-destructive">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-destructive text-sm">{error}</p>
                  <Button variant="ghost" size="sm" onClick={clearError}>
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep !== CalculatorStep.SCENARIO_RESULTS && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === CalculatorStep.SERVICE_CONFIGURATION}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep === CalculatorStep.GOAL_SETTING ? (
                  <Button
                    onClick={generateScenarios}
                    disabled={!canProceedToNextStep() || isGeneratingScenarios}
                    className="flex items-center gap-2"
                  >
                    {isGeneratingScenarios ? (
                      <>
                        <motion.div 
                          className="rounded-full h-4 w-4 border-b-2 border-white"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Generate AI Scenarios
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate AI Scenarios
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className="flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </ErrorBoundary>
    </ToolLayout>
  );
}