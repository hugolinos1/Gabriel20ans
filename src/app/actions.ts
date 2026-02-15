'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { suggestRsvpQuestions } from '@/ai/flows/suggest-rsvp-questions-flow';

const rsvpSchema = z.object({
  email: z.string().email({ message: 'A valid email is required.' }),
  isAttending: z.enum(['yes', 'no'], {
    required_error: 'Please select an option.',
  }),
  plusOnes: z.coerce.number().min(0).optional(),
  dietaryRestrictions: z.string().optional(),
  songRequest: z.string().optional(),
});

export type RsvpState = {
  errors?: {
    email?: string[];
    isAttending?: string[];
    plusOnes?: string[];
    dietaryRestrictions?: string[];
    songRequest?: string[];
  };
  message?: string | null;
};

export async function submitRsvp(
  prevState: RsvpState,
  formData: FormData
): Promise<RsvpState> {
  const validatedFields = rsvpSchema.safeParse({
    email: formData.get('email'),
    isAttending: formData.get('isAttending'),
    plusOnes: formData.get('plusOnes'),
    dietaryRestrictions: formData.get('dietaryRestrictions'),
    songRequest: formData.get('songRequest'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to submit RSVP. Please check your answers.',
    };
  }

  // In a real app, you would save validatedFields.data to a database.
  console.log('RSVP Submitted:', validatedFields.data);

  if (validatedFields.data.isAttending === 'no') {
    redirect('/confirmation'); // Redirect even if not attending
  }

  // Only redirect on success
  redirect('/confirmation');
}

export async function getSuggestedQuestions(
  eventType: string,
  existingQuestions: string[]
) {
  try {
    const result = await suggestRsvpQuestions({ eventType, existingQuestions });
    return { success: true, questions: result.suggestedQuestions };
  } catch (error) {
    console.error('Error suggesting questions:', error);
    return {
      success: false,
      message: 'Failed to get suggestions. Please try again.',
    };
  }
}
