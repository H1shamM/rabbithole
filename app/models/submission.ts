/**
 * @fileoverview Submission model definition.
 */

import { z } from 'zod';

/**
 * Zod schema for a URL submission.
 */
export const SubmissionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  url: z.string().url(),
  title: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  created_at: z.date(),
});

/**
 * Type inferred from SubmissionSchema.
 */
export type Submission = z.infer<typeof SubmissionSchema>;
