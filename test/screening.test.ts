import assert from "node:assert/strict";
import { decideCaption } from "../src/fintech_screening.ts";

assert.equal(decideCaption("Paid invoice for order 42"), "approved");
assert.equal(decideCaption("Receipt includes a one-time code"), "held");
console.log("screening decisions passed");

