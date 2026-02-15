'use client';

import { useActionState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { submitRsvp, type RsvpState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type RsvpFormValues = {
  email: string;
  attendingNoon?: 'yes' | 'no';
  peopleNoon?: number;
  attendingEvening?: 'yes' | 'no';
  peopleEvening?: number;
  comments?: string;
};

export default function RsvpForm({ email }: { email: string }) {
  const { toast } = useToast();
  const initialState: RsvpState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(submitRsvp, initialState);

  const form = useForm<RsvpFormValues>({
    defaultValues: {
      email,
      attendingNoon: undefined,
      peopleNoon: 1,
      attendingEvening: undefined,
      peopleEvening: 1,
      comments: '',
    },
  });

  const attendingNoon = form.watch('attendingNoon');
  const attendingEvening = form.watch('attendingEvening');

  useEffect(() => {
    if (state.message && state.errors && Object.keys(state.errors).length > 0) {
      toast({
        variant: 'destructive',
        title: 'Une erreur est survenue',
        description: state.message,
      });
    }
  }, [state, toast]);

  const onSubmit = (data: RsvpFormValues) => {
    const formData = new FormData();
    (Object.keys(data) as (keyof RsvpFormValues)[]).forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    dispatch(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Participation</CardTitle>
            <CardDescription>
              Veuillez remplir le formulaire pour nous informer de votre
              présence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* MIDI */}
            <FormField
              control={form.control}
              name="attendingNoon"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    Serez-vous présents le samedi 18 Juillet midi ?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Oui</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">Non</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage>{state.errors?.attendingNoon?.[0]}</FormMessage>
                </FormItem>
              )}
            />

            {attendingNoon === 'yes' && (
              <div key="noon-fields" className="pl-4 border-l ml-2 space-y-4">
                <FormField
                  control={form.control}
                  name="peopleNoon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Combien de personnes seront présentes ?
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage>{state.errors?.peopleNoon?.[0]}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            )}
            {attendingNoon === 'no' && (
              <p className="italic text-muted-foreground">Ah ! Dommage :-(</p>
            )}

            {/* SOIR */}
            <FormField
              control={form.control}
              name="attendingEvening"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">
                    Serez-vous présent le samedi 18 Juillet au soir ?
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="yes" />
                        </FormControl>
                        <FormLabel className="font-normal">Oui</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">Non</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage>
                    {state.errors?.attendingEvening?.[0]}
                  </FormMessage>
                </FormItem>
              )}
            />

            {attendingEvening === 'yes' && (
              <div key="evening-fields" className="pl-4 border-l ml-2 space-y-4">
                <FormField
                  control={form.control}
                  name="peopleEvening"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Combien de personnes seront présentes ?
                      </FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage>
                        {state.errors?.peopleEvening?.[0]}
                      </FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            )}
            {attendingEvening === 'no' && (
              <p className="italic text-muted-foreground">Ah ! Dommage :-(</p>
            )}

            {/* COMMENTAIRES */}
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commentaires</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Laissez un commentaire ici..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{state.errors?.comments?.[0]}</FormMessage>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={!attendingNoon || !attendingEvening || form.formState.isSubmitting}
            >
              Envoyer ma réponse
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
