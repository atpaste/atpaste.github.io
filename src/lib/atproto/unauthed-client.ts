import { decryptData } from '$lib/crypto';
import { decompress } from '$lib/zlib';
import type { At } from '@atcute/client/lexicons';
import { KittyAgent } from 'kitty-agent';

export async function downloadPaste(did: At.DID, rkey: string) {
    const unauthedAgent = await KittyAgent.getOrCreatePds(did);

    const { value: record, uri } = await unauthedAgent.get({
        collection: 'blue.zio.atfile.upload',
        repo: did,
        rkey,
    });

    if (!record.blob) {
        return { uri, text: '' };
    }

    const blob: Uint8Array = await unauthedAgent.getBlobAsBinary({
        did,
        cid: record.blob.ref.$link,
    });

    return { uri, text: new TextDecoder().decode(await decompress(blob)) };
}

export async function downloadEncryptedPaste(did: At.DID, rkey: string, passphrase: string) {
    const unauthedAgent = await KittyAgent.getOrCreatePds(did);

    const { value: record, uri } = await unauthedAgent.get({
        collection: 'blue.zio.atfile.upload',
        repo: did,
        rkey,
    });

    if (!record.blob) {
        return { uri, text: '' };
    }

    const blob: Uint8Array = await unauthedAgent.getBlobAsBinary({
        did,
        cid: record.blob.ref.$link,
    });

    return { uri, text: new TextDecoder().decode(await decryptData(blob, passphrase)) };
}
