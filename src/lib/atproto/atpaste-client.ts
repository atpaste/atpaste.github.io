import { type KittyAgent, getSha256, ShortId } from 'kitty-agent';
import type { At } from '@atcute/client/lexicons';
import { now as tidNow } from '@atcute/tid';
import { compress } from '$lib/zlib';
import { encryptData, generatePassphrase } from '$lib/crypto';

export class AtpasteClient {
    constructor(private readonly loginState: {
        readonly handle: string;
        readonly did: At.DID;
        readonly pds: string;
        readonly agent: KittyAgent;
    }) {}

    get agent(): KittyAgent {
        return this.loginState.agent;
    }

    get user() {
        return this.loginState;
    }

    async uploadPaste(
        pasteContents: string,
        compression?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
        existingCid?: string,
    ): Promise<{ rkey: string; cid: At.CID; uri: At.Uri; }> {
        const pageBinary = await compress(new TextEncoder().encode(pasteContents), compression);
        const mimeType = 'application/zlib';

        const blob = await this.agent.uploadBlob(new Blob([pageBinary], { type: mimeType }));

        const rkey = ShortId.now();

        const result = await this.agent.put({
            collection: 'blue.zio.atfile.upload',
            repo: this.user.did,
            rkey,
            swapCommit: existingCid,
            record: {
                $type: 'blue.zio.atfile.upload',
                blob: blob,
                file: {
                    mimeType,
                    modifiedAt: new Date().toISOString(),
                    name: rkey,
                    size: pageBinary.length
                },
                createdAt: new Date().toISOString(),
                finger: {
                    $type: 'blue.zio.atfile.finger#browser',
                    id: 'io.github.atpaste.paste',
                    userAgent: navigator.userAgent,
                },
            }
        });

        return { ...result, rkey };
    }
    
    async uploadFile(
        file: Uint8Array | Blob,
        existingCid?: string,
    ): Promise<{ rkey: string; cid: At.CID; uri: At.Uri; blob: { pds: string; did: At.DID; cid: At.CID; } }> {
        const mimeType = file instanceof Blob
            ? file.type
            : (await import('file-type-mime')).parse(file.buffer as ArrayBuffer)?.mime ?? 'application/octet-stream';

        const blob = await this.agent.uploadBlob(new Blob([file], { type: mimeType }));

        const rkey = ShortId.now();

        const result = await this.agent.put({
            collection: 'blue.zio.atfile.upload',
            repo: this.user.did,
            rkey,
            swapCommit: existingCid,
            record: {
                $type: 'blue.zio.atfile.upload',
                blob: blob,
                file: {
                    mimeType,
                    modifiedAt: new Date().toISOString(),
                    name: rkey,
                    size: 'size' in file ? file.size : file.length
                },
                createdAt: new Date().toISOString(),
                finger: {
                    $type: 'blue.zio.atfile.finger#browser',
                    id: 'io.github.atpaste.file',
                    userAgent: navigator.userAgent,
                },
            }
        });

        return {
            ...result,
            rkey,
            blob: {
                cid: blob.ref.$link,
                did: this.user.did,
                pds: this.user.pds,
            }
        };
    }
    
    async uploadEncryptedPaste(
        pasteContents: string,
        existingCid?: string,
    ): Promise<{ passphrase: string, rkey: string; cid: At.CID; uri: At.Uri; }> {
        const passphrase = generatePassphrase(128);
        const pageBinary = await encryptData(new TextEncoder().encode(pasteContents), passphrase);
        const mimeType = 'application/vnd.age'; // https://github.com/jshttp/mime-db/blob/49f8df0e170c7b40785e8aa4f464793b7fcfa41b/src/iana-types.json#L3277-L3282

        const blob = await this.agent.uploadBlob(new Blob([pageBinary], { type: mimeType }));

        const rkey = ShortId.now();
        const date = new Date().toISOString();

        const result = await this.agent.put({
            collection: 'blue.zio.atfile.upload',
            repo: this.user.did,
            rkey,
            swapCommit: existingCid,
            record: {
                $type: 'blue.zio.atfile.upload',
                blob: blob,
                file: {
                    mimeType,
                    modifiedAt: date,
                    name: rkey,
                    size: pageBinary.length
                },
                createdAt: date,
                finger: {
                    $type: 'blue.zio.atfile.finger#browser',
                    id: 'io.github.atpaste.paste',
                    userAgent: navigator.userAgent,
                },
                checksum: {
                    algo: 'sha-256',
                    hash: getSha256(blob)
                }
            }
        });

        return { ...result, rkey, passphrase };
    }

    async listPastesAndFiles(): Promise<{ rkey: string; blob?: At.Blob<string>; cid: string; isEncrypted: boolean; isFile: boolean; }[]> {
        const { records: uploads } = await this.agent.list({
            collection: 'blue.zio.atfile.upload',
            repo: this.user.did,
        });

        return uploads
            .filter(upload => upload.value.finger?.id === 'io.github.atpaste.paste' || upload.value.finger?.id === 'io.github.atpaste.file')
            .map(upload => ({
                rkey: upload.uri.rkey,
                blob: upload.value.blob,
                cid: upload.cid,
                isEncrypted: upload.value.file?.mimeType === 'application/vnd.age',
                isFile: upload.value.finger?.id === 'io.github.atpaste.file',
            }));
    }
    
    async deletePasteOrFile(rkey: string, cid?: string) {
        await this.agent.delete({
            collection: 'blue.zio.atfile.upload',
            repo: this.user.did,
            rkey,
            swapRecord: cid,
        })
    }
}
