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
    const eventType = "une fête pour un 20e anniversaire";
    const existingQuestions = ["Serez-vous présent(e) ?", "Combien d'invités ?", "Restrictions alimentaires ?"];
    
    const result = await getSuggestedQuestions(eventType, existingQuestions);

    if (result.success && result.questions) {
      setSuggestions(result.questions);
    } else {
      toast({
        variant: 'destructive',
        title: 'Échec de la suggestion',
        description: result.message || "Impossible d'obtenir les suggestions de l'IA.",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="bg-muted/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Wand2 className="h-5 w-5 text-primary" />
            Pour l'organisateur : Suggestion de questions par l'IA
        </CardTitle>
        <CardDescription>
            Besoin d'idées ? Utilisez l'IA pour générer des questions pertinentes pour votre événement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleClick} disabled={loading} variant="outline">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Suggérer des questions
        </Button>
        {suggestions.length > 0 && (
          <div className="mt-4 space-y-2 rounded-md border border-dashed p-4">
            <h4 className="font-semibold text-sm">Questions suggérées :</h4>
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
