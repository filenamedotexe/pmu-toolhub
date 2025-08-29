'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  CalculatorSession, 
  Service, 
  OperatingHours, 
  Scenario, 
  CalculatorStep,
  ServiceFormData,
  OperatingHoursFormData,
  GoalSettingFormData 
} from '../types/calculator';

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

export function useCalculatorState(sessionId?: string) {
  const router = useRouter();
  const supabase = createClient();
  
  const [state, setState] = useState<CalculatorState>({
    currentStep: CalculatorStep.SERVICE_CONFIGURATION,
    session: null,
    services: [],
    operatingHours: null,
    goalSetting: null,
    scenarios: [],
    isLoading: false,
    error: null
  });

  // Load session data
  const loadSession = useCallback(async (id?: string) => {
    if (!id) return;
    
    console.log('🔍 Loading session:', id);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data: session, error: sessionError } = await supabase
        .from('calculator_sessions')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log('🔍 Session query result:', { session, error: sessionError });
      if (sessionError) throw sessionError;

      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('session_id', id);

      console.log('🔍 Services query result:', { services, error: servicesError });

      const { data: operatingHours, error: hoursError } = await supabase
        .from('operating_hours')
        .select('*')
        .eq('session_id', id)
        .maybeSingle();  // Use maybeSingle to handle no results

      console.log('🔍 Operating hours query result:', { operatingHours, error: hoursError });

      const { data: scenarios, error: scenariosError } = await supabase
        .from('scenarios')
        .select('*')
        .eq('session_id', id);

      console.log('🔍 Scenarios query result:', { scenarios, error: scenariosError });

      setState(prev => ({
        ...prev,
        session,
        services: services || [],
        operatingHours,
        scenarios: scenarios || [],
        isLoading: false
      }));
      
      console.log('✅ Session loaded successfully');
    } catch (error) {
      console.error('❌ Load session error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load session',
        isLoading: false
      }));
    }
  }, [supabase]);

  // Create new session
  const createSession = useCallback(async (): Promise<string | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: session, error } = await supabase
        .from('calculator_sessions')
        .insert([{
          user_id: user.id,
          name: `Calculator Session ${new Date().toLocaleDateString()}`,
          status: 'draft'
        }])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        session,
        isLoading: false
      }));

      return session.id;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create session',
        isLoading: false
      }));
      return null;
    }
  }, [supabase]);

  // Save service
  const saveService = useCallback(async (serviceData: ServiceFormData): Promise<boolean> => {
    console.log('🔍 saveService called with:', serviceData);
    
    // Get fresh session state
    setState(prev => {
      console.log('🔍 Current session from fresh state:', prev.session?.id);
      return prev;
    });
    
    // Use a ref or get session ID from URL params as backup
    const urlParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = urlParams.get('session');
    
    const currentSessionId = state.session?.id || sessionIdFromUrl;
    console.log('🔍 Using session ID:', currentSessionId);
    
    if (!currentSessionId) {
      console.error('❌ No session ID available');
      setState(prev => ({ ...prev, error: 'No active session. Please refresh the page.' }));
      return false;
    }
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const insertData = {
        session_id: currentSessionId,
        name: serviceData.name,
        price: serviceData.price,
        duration_minutes: serviceData.duration_minutes,
        service_type: serviceData.service_type,
        parent_service_id: serviceData.parent_service_id || null,
        preference_rating: serviceData.preference_rating,
        current_monthly_bookings: serviceData.current_monthly_bookings
      };
      
      console.log('🔍 Inserting data:', insertData);
      
      const { data, error } = await supabase
        .from('services')
        .insert([insertData])
        .select()
        .single();

      console.log('🔍 Supabase response:', { data, error });

      if (error) throw error;

      setState(prev => {
        const newServices = [...prev.services, data];
        console.log('🔍 Updating services state:', { 
          previousCount: prev.services.length, 
          newCount: newServices.length,
          newService: data 
        });
        return {
          ...prev,
          services: newServices,
          isLoading: false
        };
      });

      console.log('✅ Service saved successfully:', data);
      
      // Force reload of services to ensure UI sync
      setTimeout(() => {
        if (sessionIdFromUrl) {
          loadSession(sessionIdFromUrl);
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('❌ Save service error:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save service',
        isLoading: false
      }));
      return false;
    }
  }, [supabase, state.session?.id]);

  // Update service
  const updateService = useCallback(async (serviceId: string, updates: Partial<ServiceFormData>): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', serviceId)
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        services: prev.services.map(s => s.id === serviceId ? data : s),
        isLoading: false
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update service',
        isLoading: false
      }));
      return false;
    }
  }, [supabase]);

  // Delete service
  const deleteService = useCallback(async (serviceId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        services: prev.services.filter(s => s.id !== serviceId),
        isLoading: false
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to delete service',
        isLoading: false
      }));
      return false;
    }
  }, [supabase]);

  // Save operating hours
  const saveOperatingHours = useCallback(async (hoursData: OperatingHoursFormData): Promise<boolean> => {
    if (!state.session?.id) return false;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Delete existing operating hours first
      await supabase
        .from('operating_hours')
        .delete()
        .eq('session_id', state.session.id);

      const { data, error } = await supabase
        .from('operating_hours')
        .insert([{
          session_id: state.session.id,
          ...hoursData
        }])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        operatingHours: data,
        isLoading: false
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to save operating hours',
        isLoading: false
      }));
      return false;
    }
  }, [supabase, state.session?.id]);

  // Navigation
  const goToStep = useCallback((step: CalculatorStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < CalculatorStep.SCENARIO_RESULTS) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > CalculatorStep.SERVICE_CONFIGURATION) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
    }
  }, [state.currentStep]);

  // Set goal setting data
  const setGoalSetting = useCallback((goalData: GoalSettingFormData) => {
    setState(prev => ({ ...prev, goalSetting: goalData }));
  }, []);

  // Set scenarios
  const setScenarios = useCallback((scenarios: Scenario[]) => {
    setState(prev => ({ ...prev, scenarios }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize session on mount
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, loadSession]);

  return {
    ...state,
    loadSession,
    createSession,
    saveService,
    updateService,
    deleteService,
    saveOperatingHours,
    goToStep,
    nextStep,
    prevStep,
    setGoalSetting,
    setScenarios,
    clearError
  };
}