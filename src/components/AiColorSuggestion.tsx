"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { suggestRelevantColor as suggestRelevantColorAction } from '@/ai/flows/suggest-relevant-color';
import type { SuggestRelevantColorOutput } from '@/ai/flows/suggest-relevant-color';
import { Wand2, Sparkles, Lightbulb } from 'lucide-react';

interface AiColorSuggestionProps {
  onApplyColor: (color: string) => void;
}

export function AiColorSuggestion({ onApplyColor }: AiColorSuggestionProps) {
  const [suggestion, setSuggestion] = useState<SuggestRelevantColorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSuggestColor = async () => {
    setIsLoading(true);
    setSuggestion(null);
    try {
      const result = await suggestRelevantColorAction({ currentDate: new Date().toISOString().split('T')[0] });
      setSuggestion(result);
      toast({
        title: "Color Suggested!",
        description: `AI suggested ${result.colorSuggestion}. Reason: ${result.reason}`,
      });
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        title: "Suggestion Failed",
        description: "Could not get a color suggestion at this time.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="h-6 w-6 text-accent" />
          AI Color Helper
        </CardTitle>
        <CardDescription>
          Let AI suggest a color based on the current day, season, or holidays.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSuggestColor} disabled={isLoading} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          {isLoading ? 'Thinking...' : 'Suggest a Color'}
        </Button>
        {suggestion && (
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5" style={{ color: suggestion.colorSuggestion }}/>
                 Suggested: <span style={{ color: suggestion.colorSuggestion, fontWeight: 'bold' }}>{suggestion.colorSuggestion}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground"><strong>Reason:</strong> {suggestion.reason}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => onApplyColor(suggestion.colorSuggestion)} className="w-full">
                Apply to Controls
              </Button>
            </CardFooter>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
