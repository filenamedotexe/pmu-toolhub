'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToolLayout } from "../shared";
import { Tool } from "@/lib/tools";
import { useState, useMemo } from "react";
import { FileText, Hash, Clock, BarChart3 } from "lucide-react";

interface TextAnalyzerToolProps {
  tool: Tool;
}

interface AnalysisResult {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  averageWordsPerSentence: number;
  longestWord: string;
  mostCommonWords: Array<{ word: string; count: number }>;
}

export function TextAnalyzerTool({ tool }: TextAnalyzerToolProps) {
  const [text, setText] = useState('');

  const analysis = useMemo((): AnalysisResult | null => {
    if (!text.trim()) return null;

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    // Reading time (assuming 200 words per minute)
    const readingTime = Math.ceil(words.length / 200);
    
    const averageWordsPerSentence = sentences.length > 0 ? Math.round((words.length / sentences.length) * 10) / 10 : 0;
    
    const longestWord = words.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );

    // Most common words (excluding common stop words)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
    
    const wordCounts = words
      .map(word => word.toLowerCase().replace(/[^a-zA-Z]/g, ''))
      .filter(word => word.length > 2 && !stopWords.has(word))
      .reduce((counts, word) => {
        counts[word] = (counts[word] || 0) + 1;
        return counts;
      }, {} as Record<string, number>);

    const mostCommonWords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    return {
      characters,
      charactersNoSpaces,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime,
      averageWordsPerSentence,
      longestWord,
      mostCommonWords
    };
  }, [text]);

  const handleClear = () => {
    setText('');
  };

  const handleSample = () => {
    setText(`Welcome to our advanced text analysis tool! This powerful application is designed to help writers, students, researchers, and professionals analyze their written content in depth.

Our tool provides comprehensive metrics including character counts, word frequency analysis, readability statistics, and estimated reading times. Whether you're working on an essay, blog post, research paper, or any other written content, this analyzer will give you valuable insights into your text.

The analysis includes both basic statistics like word and character counts, as well as more advanced metrics such as average sentence length and most frequently used words. This information can help you improve your writing style, ensure appropriate length for your target audience, and identify potential areas for improvement.

Try pasting your own text above to see detailed analysis results, or continue reading this sample text to explore all the features our tool has to offer.`);
  };

  return (
    <ToolLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Text Input</CardTitle>
              <CardDescription>
                Paste or type your text below to analyze it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Text to Analyze</Label>
                <Textarea
                  id="text-input"
                  placeholder="Paste your text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSample} variant="outline">
                  Load Sample Text
                </Button>
                <Button onClick={handleClear} variant="outline">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {analysis ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Basic Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Characters:</span>
                    <span className="font-medium">{analysis.characters.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Characters (no spaces):</span>
                    <span className="font-medium">{analysis.charactersNoSpaces.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Words:</span>
                    <span className="font-medium">{analysis.words.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Sentences:</span>
                    <span className="font-medium">{analysis.sentences}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paragraphs:</span>
                    <span className="font-medium">{analysis.paragraphs}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Reading Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Reading time:</span>
                    <span className="font-medium">{analysis.readingTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Avg. words/sentence:</span>
                    <span className="font-medium">{analysis.averageWordsPerSentence}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Longest word:</span>
                    <span className="font-medium text-xs">{analysis.longestWord}</span>
                  </div>
                </CardContent>
              </Card>

              {analysis.mostCommonWords.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Top Words
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.mostCommonWords.map(({ word, count }, index) => (
                        <div key={word} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{word}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ 
                                  width: `${(count / analysis.mostCommonWords[0].count) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium w-6 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Enter some text to see analysis results</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}