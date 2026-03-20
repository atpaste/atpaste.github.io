import type {} from "@atcute/lexicons";
import * as v from "@atcute/lexicons/validations";
import type {} from "@atcute/lexicons/ambient";
import * as BlueZioAtfileFinger from "./finger.js";
import * as BlueZioAtfileMeta from "./meta.js";

const _checksumSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("blue.zio.atfile.upload#checksum"),
  ),
  algo: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  hash: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
});
const _fileSchema = /*#__PURE__*/ v.object({
  $type: /*#__PURE__*/ v.optional(
    /*#__PURE__*/ v.literal("blue.zio.atfile.upload#file"),
  ),
  mimeType: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  modifiedAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
  name: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.string()),
  size: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.integer()),
});
const _mainSchema = /*#__PURE__*/ v.record(
  /*#__PURE__*/ v.string(),
  /*#__PURE__*/ v.object({
    $type: /*#__PURE__*/ v.literal("blue.zio.atfile.upload"),
    /**
     * @maxSize 1000000000000
     */
    blob: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.blob()),
    get checksum() {
      return /*#__PURE__*/ v.optional(checksumSchema);
    },
    createdAt: /*#__PURE__*/ v.optional(/*#__PURE__*/ v.datetimeString()),
    get file() {
      return /*#__PURE__*/ v.optional(fileSchema);
    },
    get finger() {
      return /*#__PURE__*/ v.optional(
        /*#__PURE__*/ v.variant([
          BlueZioAtfileFinger.browserSchema,
          BlueZioAtfileFinger.machineSchema,
        ]),
      );
    },
    get meta() {
      return /*#__PURE__*/ v.optional(
        /*#__PURE__*/ v.variant([BlueZioAtfileMeta.unknownSchema]),
      );
    },
  }),
);

type checksum$schematype = typeof _checksumSchema;
type file$schematype = typeof _fileSchema;
type main$schematype = typeof _mainSchema;

export interface checksumSchema extends checksum$schematype {}
export interface fileSchema extends file$schematype {}
export interface mainSchema extends main$schematype {}

export const checksumSchema = _checksumSchema as checksumSchema;
export const fileSchema = _fileSchema as fileSchema;
export const mainSchema = _mainSchema as mainSchema;

export interface Checksum extends v.InferInput<typeof checksumSchema> {}
export interface File extends v.InferInput<typeof fileSchema> {}
export interface Main extends v.InferInput<typeof mainSchema> {}

declare module "@atcute/lexicons/ambient" {
  interface Records {
    "blue.zio.atfile.upload": mainSchema;
  }
}
