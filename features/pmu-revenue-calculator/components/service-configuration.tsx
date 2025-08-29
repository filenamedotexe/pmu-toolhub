'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Lightbulb } from 'lucide-react';
import { ServiceFormData, ServiceType, PMU_SERVICE_TEMPLATES } from '../types/calculator';
import { useCalculatorState } from '../hooks/use-calculator-state';

const ServiceFormSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  duration_minutes: z.number().min(1, "Duration is required"),
  service_type: z.enum(['one_time', 'first_session', 'touch_up', 'refresher', 'lash_extension', 'custom']),
  parent_service_id: z.string().optional(),
  preference_rating: z.number().min(1).max(5),
  current_monthly_bookings: z.number().min(0)
});

export function ServiceConfiguration() {
  const { services, saveService, deleteService, isLoading } = useCalculatorState();
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      duration_minutes: 0,
      service_type: 'one_time',
      preference_rating: 3,
      current_monthly_bookings: 0
    }
  });

  const selectedServiceType = form.watch('service_type');
  const parentServices = services.filter(s => s.service_type === 'first_session');

  const onSubmit = async (data: ServiceFormData) => {
    console.log('🔍 Form submitted with data:', data);
    console.log('🔍 Form errors:', form.formState.errors);
    
    try {
      const success = await saveService(data);
      console.log('🔍 Save result:', success);
      
      if (success) {
        setShowSuccess(true);
        form.reset();
        setEditingService(null);
        setTimeout(() => setShowSuccess(false), 2000);
        console.log('✅ Service saved and form reset');
      } else {
        console.error('❌ Save service returned false');
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
    }
  };

  const addTemplateService = (template: Partial<ServiceFormData>) => {
    form.reset({
      name: template.name || '',
      price: template.price || 0,
      duration_minutes: template.duration_minutes || 0,
      service_type: template.service_type || 'one_time',
      preference_rating: template.preference_rating || 3,
      current_monthly_bookings: 0
    });
    setShowTemplates(false);
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteService(serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Configure Your PMU Services</h3>
        <p className="text-muted-foreground">
          Add all the services you offer, including pricing and duration. Set up relationships between first sessions and touch-ups.
        </p>
      </div>

      {/* Existing Services */}
      {services.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium">Your Services ({services.length})</h4>
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id} className="relative">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{service.name}</h5>
                        <Badge variant="secondary">
                          {service.service_type.replace('_', ' ')}
                        </Badge>
                        {service.parent_service_id && (
                          <Badge variant="outline" className="text-xs">
                            Touch-up/Refresher
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Price: ${service.price} " Duration: {service.duration_minutes}min</div>
                        <div>Current bookings: {service.current_monthly_bookings}/month</div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Service Templates */}
      {!showTemplates ? (
        <Button
          variant="outline"
          onClick={() => setShowTemplates(true)}
          className="w-full flex items-center gap-2"
        >
          <Lightbulb className="h-4 w-4" />
          Use PMU Service Templates
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Common PMU Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {PMU_SERVICE_TEMPLATES.map((template, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="h-auto p-4 justify-start"
                  onClick={() => addTemplateService(template)}
                >
                  <div className="text-left space-y-1">
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${template.price} " {template.duration_minutes}min
                    </div>
                  </div>
                </Button>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowTemplates(false)}
              className="w-full mt-4"
            >
              Hide Templates
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add New Service Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingService ? 'Edit Service' : 'Add New Service'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="e.g., Microblading First Session"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <select
                  id="service_type"
                  {...form.register('service_type')}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select service type</option>
                  <option value="one_time">One-time Service</option>
                  <option value="first_session">First Session</option>
                  <option value="touch_up">Touch-up</option>
                  <option value="refresher">Annual Refresher</option>
                  <option value="lash_extension">Lash Extension</option>
                  <option value="custom">Custom Service</option>
                </select>
                {form.formState.errors.service_type && (
                  <p className="text-sm text-destructive">{form.formState.errors.service_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...form.register('price', { valueAsNumber: true })}
                  placeholder="400"
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                <Input
                  id="duration_minutes"
                  type="number"
                  min="1"
                  {...form.register('duration_minutes', { valueAsNumber: true })}
                  placeholder="180"
                />
                {form.formState.errors.duration_minutes && (
                  <p className="text-sm text-destructive">{form.formState.errors.duration_minutes.message}</p>
                )}
              </div>
            </div>

            {/* Parent Service Selection for touch-ups and refreshers */}
            {(selectedServiceType === 'touch_up' || selectedServiceType === 'refresher') && (
              <div className="space-y-2">
                <Label htmlFor="parent_service_id">Parent Service</Label>
                <select
                  id="parent_service_id"
                  {...form.register('parent_service_id')}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select the first session this relates to</option>
                  {parentServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} (${service.price})
                    </option>
                  ))}
                </select>
                {parentServices.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    You need to add a "First Session" service before creating touch-ups or refreshers.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              {editingService && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setEditingService(null);
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="relative">
                {editingService ? 'Update Service' : 'Add Service'}
                <AnimatePresence>
                  {showSuccess && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute inset-0 bg-green-500 rounded-md flex items-center justify-center text-white"
                    >
                      ✓ Saved!
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <h5 className="font-medium text-foreground">Service Type Guide:</h5>
            <ul className="space-y-1 ml-4">
              <li><strong>First Session:</strong> Initial service that can have touch-ups</li>
              <li><strong>Touch-up:</strong> Follow-up service done within 6-8 weeks</li>
              <li><strong>Annual Refresher:</strong> Yearly maintenance service</li>
              <li><strong>Lash Extension:</strong> Special category for lash services</li>
              <li><strong>One-time:</strong> Standalone services without follow-ups</li>
              <li><strong>Custom:</strong> Unique services not covered above</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {services.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Plus className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No services added yet</p>
              <p className="text-sm text-muted-foreground">
                Start by adding your first service or use a template above
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}