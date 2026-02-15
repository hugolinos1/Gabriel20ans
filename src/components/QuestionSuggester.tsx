'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSuggestedQuestions } from '@/app/actions';
import { Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function QuestionSuggester() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    setLoading(true);
    setSuggestions([]);
    const eventType = "a 20th birthday celebration";
    const existingQuestions = ["Will you be attending?", "How many guests?", "Dietary Restrictions?"];
    
    const result = await getSuggestedQuestions(eventType, existingQuestions);

    if (result.success && result.questions) {
      setSuggestions(result.questions);
    } else {
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: result.message || 'Could not fetch AI suggestions.',
      });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Wand2 className="h-5 w-5 text-primary" />
            For The Organizer: AI Question Suggester
        </CardTitle>
        <CardDescription>
            Need ideas? Use AI to generate relevant questions for your event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Suggest Questions
        </Button>
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2 rounded-md border border-dashed p-4">
            <h4 className="font-semibold text-sm">Suggested Questions:</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {suggestions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
