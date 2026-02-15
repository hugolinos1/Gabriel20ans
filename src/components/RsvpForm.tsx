'use client';

import { useFormState } from 'react-dom';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitRsvp, type RsvpState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { QuestionSuggester } from '@/components/QuestionSuggester';

const RsvpFormSchema = z.object({
  email: z.string().email(),
  isAttending: z.enum(['yes', 'no'], {
    required_error: 'Please let us know if you can make it.',
  }),
  plusOnes: z.coerce.number().min(0).max(5).optional(),
  dietaryRestrictions: z.string().max(300).optional(),
  songRequest: z.string().max(100).optional(),
});

type RsvpFormValues = z.infer<typeof RsvpFormSchema>;

export default function RsvpForm({ email }: { email: string }) {
  const { toast } = useToast();
  const initialState: RsvpState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(submitRsvp, initialState);

  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(RsvpFormSchema),
    defaultValues: {
      email,
      isAttending: undefined,
      plusOnes: 0,
      dietaryRestrictions: '',
      songRequest: '',
    },
  });

  const isAttending = form.watch('isAttending');

  useEffect(() => {
    if (state.message) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <Form {...form}>
      <form action={dispatch}>
        <input type="hidden" {...form.register('email')} />
        <Card className="w-full shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">RSVP</CardTitle>
            <CardDescription>
              Please fill out the form to let us know if you can make it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <FormField
              control={form.control}
              name="isAttending"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-base">Will you be attending?</FormLabel>
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
                        <FormLabel className="font-normal">Yes, I'll be there!</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="no" />
                        </FormControl>
                        <FormLabel className="font-normal">No, I can't make it.</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage>{state.errors?.isAttending?.[0]}</FormMessage>
                </FormItem>
              )}
            />

            {isAttending === 'yes' && (
              <div
                key="attending-fields"
                className="space-y-8 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                data-state="open"
              >
                <FormField
                  control={form.control}
                  name="plusOnes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guests</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="5" {...field} />
                      </FormControl>
                      <FormDescription>How many people are in your party (including yourself)?</FormDescription>
                      <FormMessage>{state.errors?.plusOnes?.[0]}</FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., vegetarian, gluten-free, nut allergy"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>{state.errors?.dietaryRestrictions?.[0]}</FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="songRequest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Request</FormLabel>
                      <FormControl>
                        <Input placeholder="Any song that will get you on the dance floor?" {...field} />
                      </FormControl>
                       <FormMessage>{state.errors?.songRequest?.[0]}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            <QuestionSuggester />

            <Button type="submit" className="w-full" size="lg" disabled={!isAttending}>
              Submit RSVP
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
