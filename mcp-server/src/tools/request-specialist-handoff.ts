import { z } from "zod";

const SpecialistType = z.enum([
  "nurse",
  "social_worker",
  "aged_care_navigator",
  "interpreter",
  "gp",
  "community_worker",
]);

const Urgency = z.enum(["routine", "soon", "urgent"]);

const inputSchema = {
  user_id: z.string().describe("Opaque anonymous session id."),
  specialist_type: SpecialistType,
  preferred_language: z.string().optional(),
  urgency: Urgency,
  summary: z
    .string()
    .describe("Short, triage-facing summary the specialist will see before picking up."),
};

const Input = z.object(inputSchema);

export const requestSpecialistHandoff = {
  name: "request_specialist_handoff",
  description: "Connect the user to a human specialist (nurse, social worker, interpreter, GP, etc.).",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const eta =
      args.urgency === "urgent" ? 5 : args.urgency === "soon" ? 30 : 240;

    const channel =
      args.specialist_type === "gp" || args.specialist_type === "nurse"
        ? "phone"
        : args.specialist_type === "interpreter"
          ? "phone"
          : args.specialist_type === "community_worker"
            ? "in_person"
            : "video";

    const result = {
      _stub: true,
      handoff_id: `hand_${crypto.randomUUID()}`,
      specialist_type: args.specialist_type,
      preferred_language: args.preferred_language ?? "en-AU",
      urgency: args.urgency,
      eta_minutes: eta,
      channel,
      status: "queued",
      queued_at: new Date().toISOString(),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
    };
  },
};
