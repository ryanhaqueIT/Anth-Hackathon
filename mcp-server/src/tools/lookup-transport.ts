import { z } from "zod";

const MobilityNeed = z.enum([
  "wheelchair",
  "walker",
  "low_step",
  "companion_required",
]);

const inputSchema = {
  from_suburb: z.string(),
  to_suburb: z.string(),
  mobility_needs: MobilityNeed.optional(),
};

const Input = z.object(inputSchema);

export const lookupTransport = {
  name: "lookup_transport",
  description:
    "Public transport (PTV) and community transport options between two suburbs. Considers mobility needs when set.",
  inputSchema,
  handler: async (args: z.infer<typeof Input>) => {
    const accessibleOnly =
      args.mobility_needs === "wheelchair" ||
      args.mobility_needs === "walker" ||
      args.mobility_needs === "low_step";

    const departsIn = (mins: number) =>
      new Date(Date.now() + mins * 60_000).toISOString();

    const options = [
      {
        mode: "tram",
        route: "Route 96 to Brunswick",
        departs_at: departsIn(8),
        duration_min: 22,
        accessible: true,
        cost: "myki, ~$5.30 daily cap (Seniors)",
      },
      {
        mode: "bus",
        route: "Route 401 university shuttle",
        departs_at: departsIn(15),
        duration_min: 18,
        accessible: true,
        cost: "Free",
      },
      {
        mode: "community_transport",
        route: "Council door-to-door, requires booking 24h ahead",
        departs_at: departsIn(60 * 24),
        duration_min: 30,
        accessible: true,
        cost: "$5 return, gold coin",
      },
      {
        mode: "taxi",
        route: "Multi-Purpose Taxi Program (subsidised)",
        departs_at: departsIn(10),
        duration_min: 15,
        accessible: args.mobility_needs === "wheelchair",
        cost: "50% subsidy with MPTP card, up to $60 per trip",
      },
    ];

    const filtered = accessibleOnly
      ? options.filter((o) => o.accessible)
      : options;

    const result = {
      _stub: true,
      from_suburb: args.from_suburb,
      to_suburb: args.to_suburb,
      mobility_needs: args.mobility_needs ?? null,
      results: filtered,
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(result) }],
    };
  },
};
