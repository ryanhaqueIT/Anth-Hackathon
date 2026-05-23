import postgres from "postgres";

type Env = {
  HYPERDRIVE?: Hyperdrive;
};

export function getClient(env: Env): postgres.Sql {
  if (!env.HYPERDRIVE?.connectionString) {
    throw new Error(
      "Postgres not wired up yet. Create a Hyperdrive resource and set the id in wrangler.jsonc.",
    );
  }

  return postgres(env.HYPERDRIVE.connectionString, {
    max: 5,
    fetch_types: false,
  });
}
