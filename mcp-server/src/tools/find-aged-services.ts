import { z } from "zod";

const ServiceType = z.enum([
  "social",
  "health",
  "transport",
  "meals",
  "home_care",
  "mental_health",
]);

const inputSchema = {
  suburb: z.string().optional().describe("Suburb name, e.g. 'Carlton'."),
  lga: z.string().optional().describe("Local Government Area, e.g. 'Melbourne'."),
  service_type: ServiceType.optional(),
};

const Input = z
  .object(inputSchema)
  .refine((v) => v.suburb || v.lga, {
    message: "Provide at least one of suburb or lga.",
  });

export const findAgedServices = {
  name: "find_aged_services",
  description:
    "Lookup aged-care and senior services near a suburb or LGA. Optionally filter by service type.",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const suburb = args.suburb ?? args.lga ?? "Carlton";

    const all = [
      {
        name: "Carlton Neighbourhood Learning Centre",
        type: "social",
        address: "20 Princes Street",
        suburb,
        phone: "03 9347 2739",
        eligibility_note: "Open to all residents 50+. No referral needed.",
        distance_km: 0.4,
      },
      {
        name: "cohealth Carlton",
        type: "health",
        address: "Drummond Street",
        suburb,
        phone: "03 9448 5511",
        eligibility_note: "Bulk-billed for Health Care Card holders.",
        distance_km: 0.7,
      },
      {
        name: "Meals on Wheels (City of Melbourne)",
        type: "meals",
        address: "Council aged-services intake",
        suburb,
        phone: "03 9658 9658",
        eligibility_note: "My Aged Care referral required for ongoing service.",
        distance_km: 1.2,
      },
    ];

    const results = args.service_type
      ? all.filter((s) => s.type === args.service_type)
      : all;

    const result = { _stub: true, results };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
    };
  },
};
