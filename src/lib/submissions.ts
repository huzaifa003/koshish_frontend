import { z } from "zod";
export const submissionSchema = z
  .object({
    kind: z.enum(["donate", "volunteer", "contact"]),
    name: z.string().trim().min(2, "Please enter your name.").max(120),
    email: z
      .email("Please enter a valid email address.")
      .max(254)
      .transform((v) => v.toLowerCase()),
    projectId: z.string().uuid().nullable().default(null),
    amount: z.number().positive().max(100000000).nullable().default(null),
    message: z
      .string()
      .trim()
      .min(10, "Please add a little more detail (at least 10 characters).")
      .max(4000),
    consent: z.literal(true, {
      error: "Please agree to being contacted about this request.",
    }),
    website: z.string().max(0).default(""),
    turnstileToken: z.string().max(2048).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "donate" && !data.amount)
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Please choose a contribution amount.",
      });
  });
