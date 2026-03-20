import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";

const _unknownSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("blue.zio.atfile.meta#unknown"),
  ),
  reason: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type unknown$schematype = typeof _unknownSchema;

export interface unknownSchema extends unknown$schematype {}

export const unknownSchema = _unknownSchema as unknownSchema;

export interface Unknown extends v.InferInput<typeof unknownSchema> {}
