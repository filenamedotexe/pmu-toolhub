'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Clock } from 'lucide-react';
import { useCalculatorState } from '../hooks/use-calculator-state';
import { calculateCurrentMonthlyRevenue, calculateTotalCurrentWeeklyHours, calculateRevenuePerHour, formatCurrency } from '../utils/calculations';

export function RevenueAssessment() {
  const { services, updateService, operatingHours, isLoading } = useCalculatorState();
  const [bookingInputs, setBookingInputs] = useState<Record<string, number>>(
    services.reduce((acc, service) => ({ ...acc, [service.id]: service.current_monthly_bookings }), {})
  );

  const currentRevenue = calculateCurrentMonthlyRevenue(services);
  const currentWeeklyHours = calculateTotalCurrentWeeklyHours(services);
  const revenuePerHour = calculateRevenuePerHour(currentRevenue, currentWeeklyHours * 4.33);

  const handleBookingChange = async (serviceId: string, bookings: number) => {
    setBookingInputs(prev => ({ ...prev, [serviceId]: bookings }));
    await updateService(serviceId, { current_monthly_bookings: bookings });
  };

  const getServiceRevenue = (service: any) => {
    const bookings = bookingInputs[service.id] || 0;
    return service.price * bookings;
  };

  const getServicePercentage = (serviceRevenue: number) => {
    if (currentRevenue === 0) return 0;
    return (serviceRevenue / currentRevenue) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Current Revenue Assessment</h3>
        <p className="text-muted-foreground">
          Input your current monthly booking numbers for each service to establish your baseline.
        </p>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Monthly Revenue</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(currentRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Weekly Hours</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {currentWeeklyHours.toFixed(1)}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Revenue/Hour</span>
            </div>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {formatCurrency(revenuePerHour)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Service Booking Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Booking Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => {
              const serviceRevenue = getServiceRevenue(service);
              const percentage = getServicePercentage(serviceRevenue);
              
              return (
                <div key={service.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={`bookings-${service.id}`} className="font-medium">
                        {service.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        ${service.price} " {service.duration_minutes}min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(serviceRevenue)}</p>
                      {percentage > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {percentage.toFixed(0)}% of total
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id={`bookings-${service.id}`}
                        type="number"
                        min="0"
                        value={bookingInputs[service.id] || 0}
                        onChange={(e) => handleBookingChange(service.id, parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="text-center"
                      />
                      <Label className="text-xs text-muted-foreground mt-1">bookings/month</Label>
                    </div>
                    {percentage > 0 && (
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {services.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2" />
              <p>No services configured yet.</p>
              <p className="text-sm">Go back to Step 1 to add your services first.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue Breakdown */}
      {currentRevenue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {services
                .filter(service => (bookingInputs[service.id] || 0) > 0)
                .sort((a, b) => getServiceRevenue(b) - getServiceRevenue(a))
                .map((service) => {
                  const serviceRevenue = getServiceRevenue(service);
                  const percentage = getServicePercentage(serviceRevenue);
                  
                  return (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{service.name}</span>
                          <span className="text-sm">{formatCurrency(serviceRevenue)} ({percentage.toFixed(0)}%)</span>
                        </div>
                        <Progress value={percentage} className="h-1" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Capacity Analysis */}
      {operatingHours && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="text-sm text-muted-foreground space-y-2">
              <h5 className="font-medium text-foreground">Capacity Analysis:</h5>
              <div className="grid gap-2 md:grid-cols-2">
                <div>Available weekly hours: {operatingHours.hours_per_week}h</div>
                <div>Current usage: {currentWeeklyHours.toFixed(1)}h</div>
                <div>Utilization: {((currentWeeklyHours / operatingHours.hours_per_week) * 100).toFixed(0)}%</div>
                <div>Revenue efficiency: {formatCurrency(revenuePerHour)}/hour</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}