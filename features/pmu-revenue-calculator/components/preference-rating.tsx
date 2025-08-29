'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, RotateCcw } from 'lucide-react';
import { useCalculatorState } from '../hooks/use-calculator-state';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  disabled?: boolean;
}

function StarRating({ rating, onRatingChange, disabled }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          className="transition-colors disabled:opacity-50"
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => !disabled && onRatingChange(star)}
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= (hoverRating || rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1: return 'Strongly Dislike';
    case 2: return 'Dislike';
    case 3: return 'Neutral';
    case 4: return 'Like';
    case 5: return 'Love';
    default: return 'Not rated';
  }
}

function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-green-600';
  if (rating === 3) return 'text-yellow-600';
  return 'text-red-600';
}

export function PreferenceRating() {
  const { services, updateService, isLoading } = useCalculatorState();

  const handleRatingChange = async (serviceId: string, rating: number) => {
    await updateService(serviceId, { preference_rating: rating });
  };

  const resetAllRatings = async () => {
    const promises = services.map(service => 
      updateService(service.id, { preference_rating: 3 })
    );
    await Promise.all(promises);
  };

  const averageRating = services.length > 0 
    ? services.reduce((sum, s) => sum + s.preference_rating, 0) / services.length
    : 0;

  const highPreferenceServices = services.filter(s => s.preference_rating >= 4);
  const lowPreferenceServices = services.filter(s => s.preference_rating <= 2);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Rate Your Service Preferences</h3>
        <p className="text-muted-foreground">
          Rate how much you enjoy performing each service. This helps optimize scenarios for your happiness.
        </p>
      </div>

      {/* Preference Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Average Rating</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-green-600">High Preference</div>
            <p className="text-2xl font-bold mt-1">{highPreferenceServices.length}</p>
            <p className="text-xs text-muted-foreground">services rated 4-5 stars</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-sm font-medium text-red-600">Low Preference</div>
            <p className="text-2xl font-bold mt-1">{lowPreferenceServices.length}</p>
            <p className="text-xs text-muted-foreground">services rated 1-2 stars</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Rating Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Rate Each Service</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllRatings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset All to Neutral
          </Button>
        </div>

        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h5 className="font-medium">{service.name}</h5>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {service.service_type.replace('_', ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ${service.price} " {service.duration_minutes}min
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-2">
                    <StarRating
                      rating={service.preference_rating}
                      onRatingChange={(rating) => handleRatingChange(service.id, rating)}
                      disabled={isLoading}
                    />
                    <p className={`text-sm font-medium ${getRatingColor(service.preference_rating)}`}>
                      {getRatingLabel(service.preference_rating)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {services.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Star className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">No services to rate yet</p>
              <p className="text-sm text-muted-foreground">
                Go back to Step 1 to add your services first
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rating Guide */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <h5 className="font-medium text-foreground">Rating Guide:</h5>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= 5 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs">Love - Maximize in scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs">Like - Include frequently</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= 3 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs">Neutral - Balance as needed</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= 2 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs">Dislike - Minimize in scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-3 w-3 ${i <= 1 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs">Strongly Dislike - Avoid if possible</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}