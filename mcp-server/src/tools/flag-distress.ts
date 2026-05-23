import { z } from "zod";

import { getEmergencyContact } from "./get-emergency-contact";

const Severity = z.enum(["low", "medium", "high", "critical"]);
const Category = z.enum([
  "loneliness",
  "health",
  "safety",
  "financial",
  "housing",
  "cognitive",
  "other",
]);

const inputSchema = {
  user_id: z.string().describe("Opaque anonymous session id."),
  severity: Severity,
  category: Category,
  summary: z
    .string()
    .describe("Short triage-facing summary. Do not include the user's name."),
  language: z.string().optional(),
};

const Input = z.object(inputSchema);

export const flagDistress = {
  name: "flag_distress",
  description:
    "Raise a distress signal for triage. Critical-severity signals also surface emergency contacts.",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const triaged = args.severity === "high" || args.severity === "critical";

    const nextAction =
      args.severity === "critical"
        ? "Surface emergency contacts to the user and notify on-call clinician."
        : args.severity === "high"
          ? "Page on-call community worker within 15 minutes."
          : args.severity === "medium"
            ? "Queue for same-day follow-up by an aged-care navigator."
            : "Add to weekly outreach list.";

    const base = {
      _stub: true,
      signal_id: `sig_${crypto.randomUUID()}`,
      severity: args.severity,
      category: args.category,
      triaged,
      next_action: nextAction,
      recorded_at: new Date().toISOString(),
    };

    if (args.severity === "critical") {
      const emergencyCategory =
        args.category === "safety"
          ? "safety"
          : args.category === "health" || args.category === "cognitive"
            ? "medical"
            : args.category === "loneliness"
              ? "mental_health"
              : "general";

      const contacts = await getEmergencyContact.handler({
        category: emergencyCategory,
        language: args.language,
      });

      const parsed = JSON.parse(contacts.content[0]?.text ?? "{}") as {
        results?: unknown;
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ ...base, emergency_contacts: parsed.results ?? [] }),
          },
        ],
      };
    }

    return {
      content: [{ type: "text" as const, text: JSON.stringify(base) }],
    };
  },
};
