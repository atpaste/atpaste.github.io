import { KittyAgent } from 'kitty-agent';
import type { At } from '@atcute/client/lexicons';
import { now as tidNow } from '@atcute/tid';
import { compress } from '$lib/zlib';

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
        existingCid?: string,
    ): Promise<{ rkey: string; cid: At.CID; uri: At.Uri; }> {
        const pageBinary = await compress(new TextEncoder().encode(pasteContents));
        const mimeType = 'application/zlib';

        const blob = await this.agent.uploadBlob(new Blob([pageBinary], { type: mimeType }));

        const rkey = tidNow();

        const result = await this.agent.put({
            collection: 'blue.zio.atfile.upload',
            repo: this.user.did,
            rkey,
            swapCommit: existingCid,
            record: {
                $type: 'blue.zio.atfile.upload',
                blob: blob,
                file: {
                    mimeType: 'application/zlib',
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
}
