import { z } from 'zod';

export const qrCodeSchema = z.object({
  qr_id: z.string(),
  qr_image: z.string(), // Base64 string or image URL
  amount: z.number(),
  currency: z.string(),
  recipient_id: z.string(),
  recipient_name: z.string(),
  expires_at: z.string().datetime(),
  status: z.enum(['PENDING', 'PAID', 'EXPIRED', 'CANCELLED']),
  created_at: z.string().datetime(),
});

export type QrCode = z.infer<typeof qrCodeSchema>;

export const generateQrRequestSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  description: z.string().optional(),
  recipient_id: z.string(),
  expiry_minutes: z.number().min(1).max(1440).default(30),
});

export type GenerateQrRequest = z.infer<typeof generateQrRequestSchema>;
