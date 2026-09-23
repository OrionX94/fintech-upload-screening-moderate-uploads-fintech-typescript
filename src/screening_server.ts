import { createServer } from "node:http";
import { screenSubmission, submissionSchema } from "./fintech_screening.ts";

const server = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/screen") {
    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "not_found" }));
    return;
  }
  try {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const parsed = submissionSchema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    const result = await screenSubmission(parsed);
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(result));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_request";
    response.writeHead(400, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: message }));
  }
});

server.listen(Number(process.env.PORT ?? 3000), () => {
  console.log("fintech screening service listening on port 3000");
});

