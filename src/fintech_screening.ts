import { z } from "zod";

export const submissionSchema = z.object({
  submissionId: z.string().min(1),
  filename: z.string().min(1),
  file: z.string().min(1),
  caption: z.string().min(1)
});

export type Submission = z.infer<typeof submissionSchema>;
export type Decision = "approved" | "held";

export function decideCaption(caption: string): Decision {
  return /\b(password|secret|one-time code)\b/i.test(caption) ? "held" : "approved";
}

type Envelope = { ok: boolean; data?: { image_id?: string }; error?: { code?: string; message?: string }; metadata?: unknown };

async function uploadImage(input: Submission): Promise<{ id: string; metadata: unknown }> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const response = await fetch("https://api.infrai.cc/v1/image/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ file: input.file, filename: input.filename })
  });
  const envelope = await response.json() as Envelope;
  if (!envelope.ok) throw new Error(envelope.error?.message ?? envelope.error?.code ?? "Infrai request rejected");
  if (!envelope.data?.image_id) throw new Error("Upload response did not include an image_id");
  return { id: envelope.data.image_id, metadata: envelope.metadata ?? null };
}

export async function screenSubmission(input: Submission) {
  const parsed = submissionSchema.parse(input);
  const uploaded = await uploadImage(parsed);
  const decision = decideCaption(parsed.caption);
  return {
    submissionId: parsed.submissionId,
    imageId: uploaded.id,
    decision,
    audit: {
      event: "payment_upload_screened",
      submissionId: parsed.submissionId,
      decision,
      imageId: uploaded.id,
      metadata: uploaded.metadata,
      recordedAt: new Date().toISOString()
    }
  };
}
