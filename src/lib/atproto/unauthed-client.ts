import { decryptData } from '$lib/crypto';
import { decompress } from '$lib/zlib';
import type { Did, Blob, LegacyBlob } from '@atcute/lexicons';
import { KittyAgent } from 'kitty-agent';
import { getBlobCid } from './blob-utils';

export async function downloadPaste(did: Did, rkey: string) {
    const unauthedAgent = await KittyAgent.getOrCreatePds(did);

    const { value: record, uri } = await unauthedAgent.getRecord({
        collection: 'blue.zio.atfile.upload',
        repo: did,
        rkey,
    });

    if (!record.blob) {
        return { uri, text: '' };
    }

    const blob: Uint8Array = await unauthedAgent.getBlobAsBinary({
        did,
        cid: getBlobCid(record.blob),
    });

    return { uri, text: new TextDecoder().decode(await decompress(blob)) };
}

export async function downloadEncryptedPaste(did: Did, rkey: string, passphrase: string) {
    const unauthedAgent = await KittyAgent.getOrCreatePds(did);

    const { value: record, uri } = await unauthedAgent.getRecord({
        collection: 'blue.zio.atfile.upload',
        repo: did,
        rkey,
    });

    if (!record.blob) {
        return { uri, text: '' };
    }

    const blob: Uint8Array = await unauthedAgent.getBlobAsBinary({
        did,
        cid: getBlobCid(record.blob),
    });

    return { uri, text: new TextDecoder().decode(await decryptData(blob, passphrase)) };
}
