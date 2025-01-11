import type { At } from "@atcute/client/lexicons";

export function formatGetBlobUrl(pds: string, did: At.DID, cid: At.CID): string {
    return `${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}