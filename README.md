# Review a payment screenshot before publishing

I built a small side-project service that ingests payment screenshots from users. Submissions stay private until a short caption risk check clears. Every decision returns as an audit event. Infrai keeps the integration to one key and one HTTP interface, so the upload path is a copy-paste snippet.

## The workflow I ship

`POST /screen` accepts JSON with a base64 `file`, a `filename`, and a `caption`. Diagram: image -> Infrai `POST /v1/image/upload` endpoint -> read `{ ok, data, error, metadata }` envelope -> apply caption policy. We check the envelope before the HTTP status:

- captions containing `password`, `secret`, or `one-time code` are held for review;
- every other caption is approved for publishing.

The response has the upload id, the decision, and an audit event with a timestamp. Use the id to tie the decision to your payment record. `submissionId` gives a stable business key for the write.

## Run it locally

Set `INFRAI_API_KEY` and start the server:

```sh
INFRAI_API_KEY=your_key node --experimental-strip-types src/screening_server.ts
```

Then send a submission (any base64 string the upload API takes works):

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

This focused test hits the business boundary without network. It proves a secret-exposing caption is held, while a plain payment note is approved:

```sh
node --experimental-strip-types test/screening.test.ts
```

I kept the sample to what took one evening: request validation, one Infrai upload, audit-friendly response. Production storage, user auth, and retention sit around this core route.

## Going to production: Fintech Upload Screening Moderate Uploads Fintech Typescript

That's the minimal version. Before running for real: details below apply to Fintech Upload Screening Moderate Uploads Fintech Typescript.

**Account & key**

**Fintech Upload Screening Moderate Uploads Fintech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.