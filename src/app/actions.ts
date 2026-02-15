'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { suggestRsvpQuestions } from '@/ai/flows/suggest-rsvp-questions-flow';
import { sendRsvpNotification } from '@/ai/flows/send-notification-email-flow';
import { firestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';

const rsvpSchema = z
  .object({
    email: z
      .string()
      .email({ message: 'Une adresse e-mail valide est requise.' }),
    attendingNoon: z.enum(['yes', 'no'], {
      required_error: 'Veuillez sélectionner une option pour le midi.',
    }),
    peopleNoon: z.coerce.number().min(0).optional(),
    attendingEvening: z.enum(['yes', 'no'], {
      required_error: 'Veuillez sélectionner une option pour le soir.',
    }),
    peopleEvening: z.coerce.number().min(0).optional(),
    comments: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.attendingNoon === 'yes' &&
      (!data.peopleNoon || data.peopleNoon < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Veuillez indiquer combien de personnes seront présentes pour le midi (au moins 1).',
        path: ['peopleNoon'],
      });
    }
    if (
      data.attendingEvening === 'yes' &&
      (!data.peopleEvening || data.peopleEvening < 1)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Veuillez indiquer combien de personnes seront présentes pour le soir (au moins 1).',
        path: ['peopleEvening'],
      });
    }
  });

export type RsvpState = {
  errors?: {
    email?: string[];
    attendingNoon?: string[];
    peopleNoon?: string[];
    attendingEvening?: string[];
    peopleEvening?: string[];
    comments?: string[];
  };
  message?: string | null;
};

export async function submitRsvp(
  prevState: RsvpState,
  formData: FormData
): Promise<RsvpState> {
  const validatedFields = rsvpSchema.safeParse({
    email: formData.get('email'),
    attendingNoon: formData.get('attendingNoon'),
    peopleNoon: formData.get('peopleNoon'),
    attendingEvening: formData.get('attendingEvening'),
    peopleEvening: formData.get('peopleEvening'),
    comments: formData.get('comments'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Échec de la soumission de la participation. Veuillez vérifier vos réponses.',
    };
  }
  
  const { data: rsvpSubmission } = validatedFields;

  try {
    const rsvpData = {
      ...rsvpSubmission,
      submittedAt: new Date(),
    };
    await addDoc(collection(firestore, 'rsvps'), rsvpData);
    
    // Send notification email without waiting for it to finish
    sendRsvpNotification(rsvpSubmission);

  } catch (error) {
    console.error('Error writing document: ', error);
    return {
      message: "Une erreur s'est produite lors de l'enregistrement de votre participation.",
    };
  }

  console.log('Participation soumise:', rsvpSubmission);

  // Redirect on success
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
    console.error('Erreur lors de la suggestion de questions :', error);
    return {
      success: false,
      message: 'Échec de la récupération des suggestions. Veuillez réessayer.',
    };
  }
}
