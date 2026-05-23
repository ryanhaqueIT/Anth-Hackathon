import { z } from "zod";

const Category = z.enum([
  "medical",
  "mental_health",
  "safety",
  "aged_care_abuse",
  "general",
]);

const inputSchema = {
  category: Category,
  language: z.string().optional().describe("BCP-47 tag. If set, results are sorted by language match."),
};

const Input = z.object(inputSchema);

type Contact = {
  name: string;
  number: string;
  hours: string;
  languages: string[];
  note?: string;
};

const TIS: Contact = {
  name: "Translating and Interpreting Service",
  number: "131 450",
  hours: "24/7",
  languages: ["multilingual"],
  note: "Use for any of the below in a language other than English.",
};

const CONTACTS: Record<z.infer<typeof Category>, Contact[]> = {
  medical: [
    {
      name: "Triple Zero (emergency)",
      number: "000",
      hours: "24/7",
      languages: ["en-AU"],
      note: "Ambulance, police or fire. Use for life-threatening situations.",
    },
    {
      name: "Nurse-on-Call",
      number: "1300 60 60 24",
      hours: "24/7",
      languages: ["en-AU"],
      note: "Free Victorian Department of Health nurse advice line.",
    },
    TIS,
  ],
  mental_health: [
    {
      name: "Lifeline",
      number: "13 11 14",
      hours: "24/7",
      languages: ["en-AU"],
    },
    {
      name: "Beyond Blue",
      number: "1300 22 4636",
      hours: "24/7",
      languages: ["en-AU"],
    },
    {
      name: "Nurse-on-Call",
      number: "1300 60 60 24",
      hours: "24/7",
      languages: ["en-AU"],
    },
    TIS,
  ],
  safety: [
    {
      name: "Triple Zero (emergency)",
      number: "000",
      hours: "24/7",
      languages: ["en-AU"],
    },
    {
      name: "1800RESPECT (family violence, sexual assault)",
      number: "1800 737 732",
      hours: "24/7",
      languages: ["en-AU"],
    },
    TIS,
  ],
  aged_care_abuse: [
    {
      name: "Elder Abuse Helpline (Seniors Rights Victoria)",
      number: "1800 353 374",
      hours: "Mon-Fri 10am-5pm",
      languages: ["en-AU"],
      note: "Also marketed as 1800 ELDERHelp.",
    },
    {
      name: "1800RESPECT",
      number: "1800 737 732",
      hours: "24/7",
      languages: ["en-AU"],
    },
    TIS,
  ],
  general: [
    {
      name: "Triple Zero (emergency)",
      number: "000",
      hours: "24/7",
      languages: ["en-AU"],
    },
    {
      name: "Nurse-on-Call",
      number: "1300 60 60 24",
      hours: "24/7",
      languages: ["en-AU"],
    },
    {
      name: "Lifeline",
      number: "13 11 14",
      hours: "24/7",
      languages: ["en-AU"],
    },
    TIS,
  ],
};

export const getEmergencyContact = {
  name: "get_emergency_contact",
  description:
    "Return the right emergency or crisis contacts for a category, including the Translating and Interpreting Service for non-English speakers.",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const results = CONTACTS[args.category];

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            _stub: true,
            category: args.category,
            language: args.language ?? "en-AU",
            results,
          }),
        },
      ],
    };
  },
};
