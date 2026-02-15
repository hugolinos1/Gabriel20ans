'use server';
/**
 * @fileOverview A Genkit flow for sending an email notification for a new RSVP.
 *
 * - sendRsvpNotification - A function that sends the email.
 * - RsvpNotificationInput - The input type for the sendRsvpNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

// Define the input schema based on the RSVP data
const RsvpNotificationInputSchema = z.object({
  email: z.string(),
  attendingNoon: z.string(),
  peopleNoon: z.coerce.number().optional(),
  attendingEvening: z.string(),
  peopleEvening: z.coerce.number().optional(),
  comments: z.string().optional(),
});
export type RsvpNotificationInput = z.infer<typeof RsvpNotificationInputSchema>;

// This is the function that will be called from the server action.
export async function sendRsvpNotification(
  input: RsvpNotificationInput
): Promise<void> {
  // We call the flow but don't wait for it to complete in the action,
  // so the user gets a fast response.
  sendRsvpNotificationFlow(input);
}

const sendRsvpNotificationFlow = ai.defineFlow(
  {
    name: 'sendRsvpNotificationFlow',
    inputSchema: RsvpNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (rsvp) => {
    // IMPORTANT: To send emails, you need to configure an email transport service.
    // This example uses nodemailer, a popular library for Node.js.
    //
    // 1. You need an email account with a service like Gmail, SendGrid, Mailgun, etc.
    // 2. You must store your credentials securely in environment variables in the .env file.
    //    DO NOT hardcode them in your code.
    //
    // Example for .env file:
    // EMAIL_HOST=smtp.example.com
    // EMAIL_PORT=587
    // EMAIL_USER=your-email@example.com
    // EMAIL_PASS=your-email-password-or-app-key

    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn("Email environment variables not set. Skipping email notification.");
        return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: Number(process.env.EMAIL_PORT || 587) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const recipient = 'hugues.rabier@gmail.com';

    const mailOptions = {
      from: `"Les 20 ans de Gabriel" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: 'Nouvelle réponse au formulaire de participation !',
      html: `
        <h1>Nouvelle participation reçue</h1>
        <p>Une nouvelle personne a répondu à l'invitation pour l'anniversaire de Gabriel.</p>
        <h2>Détails :</h2>
        <ul>
          <li><strong>Email :</strong> ${rsvp.email}</li>
          <li><strong>Présence midi :</strong> ${rsvp.attendingNoon === 'yes' ? 'Oui' : 'Non'}</li>
          ${rsvp.attendingNoon === 'yes' ? `<li><strong>Personnes midi :</strong> ${rsvp.peopleNoon}</li>` : ''}
          <li><strong>Présence soir :</strong> ${rsvp.attendingEvening === 'yes' ? 'Oui' : 'Non'}</li>
          ${rsvp.attendingEvening === 'yes' ? `<li><strong>Personnes soir :</strong> ${rsvp.peopleEvening}</li>` : ''}
          <li><strong>Commentaires :</strong> ${rsvp.comments || 'Aucun'}</li>
        </ul>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Notification email sent successfully to', recipient);
    } catch (error) {
      console.error('Error sending notification email:', error);
      // In a real application, you might want to add more robust error handling,
      // like retrying or logging to a monitoring service.
    }
  }
);
