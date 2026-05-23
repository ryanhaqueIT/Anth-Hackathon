import { z } from "zod";

const inputSchema = {
  user_id: z.string().describe("Opaque anonymous session id. No PII."),
  mood: z.number().int().min(1).max(5).describe("Self-reported mood, 1 (worst) to 5 (best)."),
  slept_well: z.boolean(),
  ate_today: z.boolean(),
  social_contact_today: z.boolean().describe("Did the user speak with another human today?"),
  notes: z.string().optional().describe("Free-text note. Will be passed to triage, not joined to identity."),
  language: z.string().optional().describe("BCP-47 tag of the language the user spoke in."),
};

const Input = z.object(inputSchema);

export const checkInRecord = {
  name: "check_in_record",
  description:
    "Log a wellbeing check-in for an anonymous user. Returns a check-in id and a flag for whether the answers warrant a follow-up.",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const followUp =
      args.mood <= 2 ||
      !args.slept_well ||
      !args.ate_today ||
      !args.social_contact_today;

    const result = {
      _stub: true,
      check_in_id: `chk_${crypto.randomUUID()}`,
      recorded_at: new Date().toISOString(),
      follow_up_suggested: followUp,
      language: args.language ?? "en-AU",
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
    };
  },
};
