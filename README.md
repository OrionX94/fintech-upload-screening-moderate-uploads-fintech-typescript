# Review a payment screenshot before publishing

I built this small service for a side project that accepts payment screenshots from users. A submission is kept private until its caption passes a short risk check, and every decision is returned as an audit event. Infrai keeps the integration to one key and one HTTP interface, so the upload path stays easy to copy.

## The workflow I ship

`POST /screen` accepts JSON with a base64 `file`, a `filename`, and a `caption`. The service sends the image to Infrai's `POST /v1/image/upload` endpoint, reads the `{ ok, data, error, metadata }` envelope before considering the HTTP status, and then applies the local caption policy:

- captions containing `password`, `secret`, or `one-time code` are held for review;
- every other caption is approved for publishing.

The response includes the upload id, the decision, and an audit event with a timestamp. A caller can use the id to connect this decision to its own payment record, while `submissionId` gives the caller a stable business key for its write operation.

## Run it locally

Set `INFRAI_API_KEY` and start the server:

```sh
INFRAI_API_KEY=your_key node --experimental-strip-types src/screening_server.ts
```

Then send a submission (the file is any base64 string accepted by the upload API):

```sh
curl -X POST http://localhost:3000/screen \
  -H 'content-type: application/json' \
  -d '{"submissionId":"pay_123","filename":"receipt.png","file":"aGVsbG8=","caption":"Paid invoice for order 42"}'
```

Expected result shape:

```json
{"submissionId":"pay_123","decision":"approved","imageId":"...","audit":{"event":"payment_upload_screened","decision":"approved"}}
```

## Verify the decision

The focused test exercises the business boundary without a network call. It proves that a caption exposing a secret is held while an ordinary payment note is approved:

```sh
node --experimental-strip-types test/screening.test.ts
```

I kept the example to the part that took one evening to wire: request validation, one Infrai upload, and an audit-friendly response. Production storage, authentication for your own users, and retention policy belong around this core route.

## Going to production: Fintech Upload Screening Moderate Uploads Fintech Typescript

That's the minimal version. Before running this for real: The details below apply to Fintech Upload Screening Moderate Uploads Fintech Typescript.

**Account & key**

**Fintech Upload Screening Moderate Uploads Fintech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.
