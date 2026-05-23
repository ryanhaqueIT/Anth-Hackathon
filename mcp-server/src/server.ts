// Anonymity-by-design.
//
// This server is invoked on behalf of vulnerable elder users by the web app.
// Tool handlers MUST NOT accept or persist:
//   - personal names, postal addresses, DOB, Medicare numbers, IHI, email, phone
//   - any free-text that could re-identify a specific person
// Allowed identifiers:
//   - opaque `user_id` (anonymous session id, no PII)
//   - `suburb` and `lga` as the smallest geographic grain
// Free-text fields (`notes`, `summary`) are passed through for triage but
// must never be joined back to identity columns in the database.

import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { checkInRecord } from "./tools/check-in-record";
import { findAgedServices } from "./tools/find-aged-services";
import { findCommunityEvent } from "./tools/find-community-event";
import { flagDistress } from "./tools/flag-distress";
import { requestSpecialistHandoff } from "./tools/request-specialist-handoff";
import { lookupTransport } from "./tools/lookup-transport";
import { getEmergencyContact } from "./tools/get-emergency-contact";

export class GroundupMCP extends McpAgent {
  server = new McpServer({
    name: "groundup-mcp",
    version: "0.0.1",
  });

  async init(): Promise<void> {
    this.server.tool(
      checkInRecord.name,
      checkInRecord.description,
      checkInRecord.inputSchema,
      checkInRecord.handler,
    );

    this.server.tool(
      findAgedServices.name,
      findAgedServices.description,
      findAgedServices.inputSchema,
      findAgedServices.handler,
    );

    this.server.tool(
      findCommunityEvent.name,
      findCommunityEvent.description,
      findCommunityEvent.inputSchema,
      findCommunityEvent.handler,
    );

    this.server.tool(
      flagDistress.name,
      flagDistress.description,
      flagDistress.inputSchema,
      flagDistress.handler,
    );

    this.server.tool(
      requestSpecialistHandoff.name,
      requestSpecialistHandoff.description,
      requestSpecialistHandoff.inputSchema,
      requestSpecialistHandoff.handler,
    );

    this.server.tool(
      lookupTransport.name,
      lookupTransport.description,
      lookupTransport.inputSchema,
      lookupTransport.handler,
    );

    this.server.tool(
      getEmergencyContact.name,
      getEmergencyContact.description,
      getEmergencyContact.inputSchema,
      getEmergencyContact.handler,
    );
  }
}
