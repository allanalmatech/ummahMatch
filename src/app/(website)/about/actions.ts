'use server';

import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  message: z.string(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export async function sendContactMessage(data: ContactFormValues) {
  // In a real-world application, you would integrate with an email service
  // like SendGrid, Nodemailer, or Resend to send an actual email.
  // For this prototype, we'll just log the message to the console.
  
  console.log('--- New Contact Form Submission ---');
  console.log('Name:', data.name);
  console.log('Email:', data.email);
  console.log('Subject:', data.subject);
  console.log('Message:', data.message);
  console.log('------------------------------------');
  
  // Simulate a successful submission
  return { success: true, error: null };
}
