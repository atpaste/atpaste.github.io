import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";

const _browserSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("blue.zio.atfile.finger#browser"),
  ),
  id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  userAgent: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _machineSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("blue.zio.atfile.finger#machine"),
  ),
  app: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  host: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  id: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  os: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});

type browser$schematype = typeof _browserSchema;
type machine$schematype = typeof _machineSchema;

export interface browserSchema extends browser$schematype {}
export interface machineSchema extends machine$schematype {}

export const browserSchema = _browserSchema as browserSchema;
export const machineSchema = _machineSchema as machineSchema;

export interface Browser extends v.InferInput<typeof browserSchema> {}
export interface Machine extends v.InferInput<typeof machineSchema> {}
