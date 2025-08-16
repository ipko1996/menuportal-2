import { z } from 'zod';

// Offer form validation schema
export const offerFormSchema = z.object({
  dishId: z.number().min(1, 'Please select a dish'),
  price: z.number().min(1, 'Price must be greater than 0'),
  availability: z.string().min(1, 'Please select an availability date'),
});

export type OfferFormData = z.infer<typeof offerFormSchema>;

// Menu form validation schema
export const menuFormSchema = z.object({
  menuName: z
    .string()
    .min(1, 'Menu name is required')
    .max(255, 'Menu name must be less than 255 characters'),
  dishes: z.array(z.number()).min(1, 'At least one dish is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  availability: z.string().min(1, 'Please select an availability date'),
});

export type MenuFormData = z.infer<typeof menuFormSchema>;
