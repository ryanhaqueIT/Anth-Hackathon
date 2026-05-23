import { z } from "zod";

const inputSchema = {
  suburb: z.string().describe("Suburb to search around."),
  when: z
    .object({
      from: z.string().describe("ISO date, inclusive."),
      to: z.string().describe("ISO date, inclusive."),
    })
    .optional(),
  interest: z
    .string()
    .optional()
    .describe("Free-text interest, e.g. 'gardening', 'mahjong', 'walking group'."),
};

const Input = z.object(inputSchema);

export const findCommunityEvent = {
  name: "find_community_event",
  description:
    "Local community events and social groups near a suburb. Optionally filter by date range and interest.",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const result = {
      _stub: true,
      results: [
        {
          title: "Carlton Library Storytime and Morning Tea",
          description:
            "Weekly social morning at the library with free tea, coffee and a guest reader.",
          location: "Carlton Library, 667 Rathdowne Street",
          starts_at: new Date(Date.now() + 86_400_000).toISOString(),
          cost: "Free",
          accessible: true,
          contact: "03 9658 9500",
        },
        {
          title: "Cantonese Mahjong at North Melbourne Senior Citizens Centre",
          description:
            "Drop-in mahjong session, tea and biscuits provided. Cantonese and English speakers welcome.",
          location: "North Melbourne Senior Citizens Centre",
          starts_at: new Date(Date.now() + 2 * 86_400_000).toISOString(),
          cost: "Gold coin",
          accessible: true,
          contact: "03 9329 7155",
        },
        {
          title: "Walking Group: Royal Park Loop",
          description:
            "Gentle 30-minute loop with a volunteer leader. Walkers and frames welcome.",
          location: "Meets at Royal Park rotunda",
          starts_at: new Date(Date.now() + 3 * 86_400_000).toISOString(),
          cost: "Free",
          accessible: true,
          contact: "Carlton Neighbourhood Learning Centre 03 9347 2739",
        },
      ],
      filters_applied: {
        suburb: args.suburb,
        when: args.when ?? null,
        interest: args.interest ?? null,
      },
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
    };
  },
};
