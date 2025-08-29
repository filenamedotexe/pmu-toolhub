'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToolLayout } from "../shared";
import { Tool } from "@/lib/tools";
import { useState, useEffect } from "react";
import { Loader2, Copy, CheckCircle2, Search, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ReviewLinkGeneratorToolProps {
  tool: Tool;
}

interface BusinessSuggestion {
  place_id: string;
  name: string;
  formatted_address: string;
  business_status: string;
  types: string[];
}

interface ReviewLinkData {
  gmbBusinessName: string | null;
  gmbPlaceId: string | null;
  gmbReviewLink: string | null;
  gmbCompleted: boolean;
  facebookPageName: string | null;
  facebookReviewLink: string | null;
  facebookCompleted: boolean;
}

export function ReviewLinkGeneratorTool({ tool }: ReviewLinkGeneratorToolProps) {
  const [reviewData, setReviewData] = useState<ReviewLinkData>({
    gmbBusinessName: null,
    gmbPlaceId: null,
    gmbReviewLink: null,
    gmbCompleted: false,
    facebookPageName: null,
    facebookReviewLink: null,
    facebookCompleted: false
  });

  const [businessSearch, setBusinessSearch] = useState('');
  const [businessSuggestions, setBusinessSuggestions] = useState<BusinessSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessSuggestion | null>(null);
  const [isGeneratingGMB, setIsGeneratingGMB] = useState(false);
  const [isGeneratingFB, setIsGeneratingFB] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing data on component mount
  useEffect(() => {
    loadReviewData();
  }, []);

  const loadReviewData = async () => {
    try {
      const response = await fetch('/api/review-links');
      if (response.ok) {
        const data = await response.json();
        setReviewData(data);
        if (data.gmbBusinessName) {
          setBusinessSearch(data.gmbBusinessName);
        }
      }
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReviewData = async (newData: Partial<ReviewLinkData>) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/review-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setReviewData(prev => ({ ...prev, ...updatedData }));
      }
    } catch (error) {
      console.error('Error saving review data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const searchBusinesses = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setBusinessSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/google-places-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBusinessSearchChange = (value: string) => {
    setBusinessSearch(value);
    setSelectedBusiness(null);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchBusinesses(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const selectBusiness = (business: BusinessSuggestion) => {
    setSelectedBusiness(business);
    setBusinessSearch(business.name);
    setBusinessSuggestions([]);
  };

  const generateGMBLink = async () => {
    if (!selectedBusiness) return;

    // Check if link already exists and ask for confirmation
    if (reviewData.gmbCompleted && reviewData.gmbReviewLink) {
      const confirmReplace = window.confirm(
        `You already have a Google My Business review link for "${reviewData.gmbBusinessName}". Do you want to replace it with a new link for "${selectedBusiness.name}"?`
      );
      if (!confirmReplace) return;
    }

    setIsGeneratingGMB(true);
    try {
      const reviewLink = `https://search.google.com/local/writereview?placeid=${selectedBusiness.place_id}`;
      
      const newData = {
        gmbBusinessName: selectedBusiness.name,
        gmbPlaceId: selectedBusiness.place_id,
        gmbReviewLink: reviewLink,
        gmbCompleted: true,
      };

      await saveReviewData(newData);
    } catch (error) {
      console.error('Error generating GMB link:', error);
    } finally {
      setIsGeneratingGMB(false);
    }
  };

  const generateFacebookLink = async () => {
    if (!reviewData.facebookPageName?.trim()) return;

    // Check if link already exists and ask for confirmation
    if (reviewData.facebookCompleted && reviewData.facebookReviewLink) {
      const confirmReplace = window.confirm(
        `You already have a Facebook review link. Do you want to replace it with a new link for "${reviewData.facebookPageName}"?`
      );
      if (!confirmReplace) return;
    }

    setIsGeneratingFB(true);
    try {
      const pageSlug = reviewData.facebookPageName.trim().toLowerCase().replace(/\s+/g, '');
      const reviewLink = `https://www.facebook.com/login/?next=https://www.facebook.com/${pageSlug}/reviews/`;
      
      const newData = {
        facebookReviewLink: reviewLink,
        facebookCompleted: true,
      };

      await saveReviewData(newData);
    } catch (error) {
      console.error('Error generating Facebook link:', error);
    } finally {
      setIsGeneratingFB(false);
    }
  };

  const generateCopyText = () => {
    const links = [];
    
    if (reviewData.gmbCompleted && reviewData.gmbReviewLink) {
      links.push(`📍 Google My Business: ${reviewData.gmbReviewLink}`);
    }
    
    if (reviewData.facebookCompleted && reviewData.facebookReviewLink) {
      links.push(`👥 Facebook Reviews: ${reviewData.facebookReviewLink}`);
    }

    return links.join('\n');
  };

  const handleCopyAll = async () => {
    const text = generateCopyText();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('All review links copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy links');
      }
    }
  };

  const handleCopyGMBLink = async () => {
    if (reviewData.gmbReviewLink) {
      try {
        await navigator.clipboard.writeText(reviewData.gmbReviewLink);
        toast.success('GMB review link copied!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleCopyFacebookLink = async () => {
    if (reviewData.facebookReviewLink) {
      try {
        await navigator.clipboard.writeText(reviewData.facebookReviewLink);
        toast.success('Facebook review link copied!');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };

  const handleRemoveGMBLink = async () => {
    const confirmRemove = window.confirm(
      'Are you sure you want to remove your Google My Business review link?'
    );
    if (!confirmRemove) return;

    const newData = {
      gmbBusinessName: null,
      gmbPlaceId: null,
      gmbReviewLink: null,
      gmbCompleted: false,
    };
    
    await saveReviewData(newData);
    setBusinessSearch('');
    setSelectedBusiness(null);
  };

  const handleRemoveFacebookLink = async () => {
    const confirmRemove = window.confirm(
      'Are you sure you want to remove your Facebook review link?'
    );
    if (!confirmRemove) return;

    const newData = {
      facebookPageName: '',
      facebookReviewLink: null,
      facebookCompleted: false,
    };
    
    await saveReviewData(newData);
  };

  if (isLoading) {
    return (
      <ToolLayout tool={tool}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout tool={tool}>
      <div className="space-y-4 sm:space-y-6">
        {/* GMB Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Google My Business Review Link
                  {reviewData.gmbCompleted && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Search for your business and generate a direct review link
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-search">Search for Your Business</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business-search"
                  placeholder="Enter business name..."
                  value={businessSearch}
                  onChange={(e) => handleBusinessSearchChange(e.target.value)}
                  className="pl-10"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                )}
              </div>
              
              {businessSuggestions.length > 0 && (
                <div className="border rounded-md bg-background shadow-md max-h-64 overflow-y-auto">
                  {businessSuggestions.map((business) => (
                    <button
                      key={business.place_id}
                      onClick={() => selectBusiness(business)}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-muted border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm sm:text-base truncate">{business.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground break-words">{business.formatted_address}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedBusiness && (
              <div className="p-3 sm:p-4 bg-muted rounded-lg">
                <div className="font-medium text-sm sm:text-base break-words">{selectedBusiness.name}</div>
                <div className="text-xs sm:text-sm text-muted-foreground break-words">{selectedBusiness.formatted_address}</div>
              </div>
            )}

            <Button 
              onClick={generateGMBLink}
              disabled={!selectedBusiness || isGeneratingGMB || isSaving}
              className="w-full"
            >
              {isGeneratingGMB ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Link...
                </>
              ) : (
                'Generate GMB Review Link'
              )}
            </Button>

            {reviewData.gmbReviewLink && (
              <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-green-800">Review Link Generated!</div>
                    <div className="text-xs sm:text-sm text-green-600 break-all overflow-wrap-anywhere word-break-all">{reviewData.gmbReviewLink}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(reviewData.gmbReviewLink!, '_blank')}
                    className="shrink-0 w-auto sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyGMBLink}
                    className="flex-1 min-h-[36px] text-xs sm:text-sm px-3 py-2"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveGMBLink}
                    className="flex-1 min-h-[36px] text-xs sm:text-sm px-3 py-2"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Remove</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facebook Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Facebook Page Review Link
                  {reviewData.facebookCompleted && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Enter your Facebook page name to generate a review link
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="facebook-page">Facebook Page Name</Label>
              <Input
                id="facebook-page"
                placeholder="e.g., myawesomebusiness"
                value={reviewData.facebookPageName || ''}
                onChange={(e) => setReviewData(prev => ({ ...prev, facebookPageName: e.target.value }))}
              />
              <div className="text-sm text-muted-foreground">
                💡 Find your page name in your Facebook URL: facebook.com/<strong>YOUR-PAGE-NAME</strong>
              </div>
            </div>

            <Button 
              onClick={generateFacebookLink}
              disabled={!reviewData.facebookPageName?.trim() || isGeneratingFB || isSaving}
              className="w-full"
            >
              {isGeneratingFB ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Link...
                </>
              ) : (
                'Generate Facebook Review Link'
              )}
            </Button>

            {reviewData.facebookReviewLink && (
              <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-green-800">Review Link Generated!</div>
                    <div className="text-xs sm:text-sm text-green-600 break-all overflow-wrap-anywhere word-break-all">{reviewData.facebookReviewLink}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(reviewData.facebookReviewLink!, '_blank')}
                    className="shrink-0 w-auto sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyFacebookLink}
                    className="flex-1 min-h-[36px] text-xs sm:text-sm px-3 py-2"
                  >
                    <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Copy Link</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveFacebookLink}
                    className="flex-1 min-h-[36px] text-xs sm:text-sm px-3 py-2"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 shrink-0" />
                    <span className="truncate">Remove</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Copy All Section */}
        {(reviewData.gmbCompleted || reviewData.facebookCompleted) && (
          <Card>
            <CardHeader>
              <CardTitle>📋 Copy All Review Links</CardTitle>
              <CardDescription>
                Get a formatted text with all your generated review links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-3 sm:p-4 bg-muted rounded-lg mb-4 overflow-hidden">
                <pre className="text-xs sm:text-sm whitespace-pre-wrap break-words font-mono leading-relaxed">{generateCopyText()}</pre>
              </div>
              <Button onClick={handleCopyAll} className="w-full min-h-[44px] text-sm px-4 py-3">
                <Copy className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">Copy All Links</span>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}