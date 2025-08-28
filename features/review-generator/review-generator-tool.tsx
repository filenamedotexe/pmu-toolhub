'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolLayout } from "../shared";
import { Tool } from "@/lib/tools";
import { useState } from "react";
import { Loader2, Copy, Star } from "lucide-react";

interface ReviewGeneratorToolProps {
  tool: Tool;
}

export function ReviewGeneratorTool({ tool }: ReviewGeneratorToolProps) {
  const [businessName, setBusinessName] = useState('');
  const [reviewType, setReviewType] = useState('');
  const [rating, setRating] = useState('');
  const [keyPoints, setKeyPoints] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!businessName || !reviewType || !rating) {
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
      const reviews = {
        'positive': {
          '5': `Absolutely outstanding experience at ${businessName}! From the moment I walked in, I was impressed by the professional atmosphere and attention to detail. ${keyPoints ? keyPoints + ' ' : ''}The team went above and beyond to ensure I was completely satisfied. I couldn't be happier with the results and will definitely be returning. Highly recommend to anyone looking for top-quality service!`,
          '4': `Really great experience at ${businessName}! ${keyPoints ? keyPoints + ' ' : ''}The staff was knowledgeable and professional throughout the entire process. Very pleased with the outcome and would definitely recommend to others. Will be coming back for sure!`
        },
        'neutral': {
          '3': `Had a decent experience at ${businessName}. ${keyPoints ? keyPoints + ' ' : ''}The service was okay and met my basic expectations. There's definitely room for improvement in some areas, but overall it was acceptable. Might consider returning in the future.`,
          '2': `My experience at ${businessName} was below average. ${keyPoints ? keyPoints + ' ' : ''}While the staff tried to be helpful, there were several issues that made the experience less than ideal. Would need to see significant improvements before considering a return visit.`
        },
        'constructive': {
          '3': `Mixed experience at ${businessName}. ${keyPoints ? keyPoints + ' ' : ''}There were some positive aspects, but also areas that could use improvement. With some adjustments to their service approach, this could be a great place. Hope to see positive changes in the future.`,
          '2': `Unfortunately, my visit to ${businessName} didn't meet expectations. ${keyPoints ? keyPoints + ' ' : ''}While I can see they're trying, there are several areas that need attention. I hope they take customer feedback seriously and make the necessary improvements.`
        }
      };

      const selectedReview = reviews[reviewType as keyof typeof reviews]?.[rating as keyof typeof reviews.positive] || 
                           'Please select valid options to generate a review.';
      
      setGeneratedReview(selectedReview);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReview);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Generator</CardTitle>
            <CardDescription>
              Generate professional reviews and content with AI assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                placeholder="Enter business name..."
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-type">Review Type</Label>
              <Select value={reviewType} onValueChange={setReviewType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="constructive">Constructive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Star Rating</Label>
              <Select value={rating} onValueChange={setRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">
                    <div className="flex items-center gap-2">
                      5 <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center gap-2">
                      4 <div className="flex">{[...Array(4)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center gap-2">
                      3 <div className="flex">{[...Array(3)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      2 <div className="flex">{[...Array(2)].map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="key-points">Key Points (Optional)</Label>
              <Textarea
                id="key-points"
                placeholder="Specific details to include..."
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!businessName || !reviewType || !rating || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Review'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Review</CardTitle>
            <CardDescription>
              Your AI-generated review will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedReview ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{generatedReview}</p>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {generatedReview.length} characters
                  </span>
                  <Button onClick={handleCopy} variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Review
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-4xl mb-4">✍️</div>
                <p>Fill out the form and click "Generate Review" to create your content.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}