import type { Did, Cid, Blob, LegacyBlob } from "@atcute/lexicons";

export function formatGetBlobUrl(pds: string, did: Did, cid: Cid): string {
    return `${pds}/xrpc/com.atproto.sync.getBlob?did=${encodeURIComponent(did)}&cid=${encodeURIComponent(cid)}`;
}

export function getBlobCid(blob: Blob | LegacyBlob) {
    if ('ref' in blob) {
        return blob.ref.$link;
    }
    return blob.cid;
}