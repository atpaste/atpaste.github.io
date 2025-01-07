import { KittyAgent } from 'kitty-agent';
import type { At } from '@atcute/client/lexicons';
import { user } from './signed-in-user';
import { AtUri } from '@atproto/syntax';
import { now as tidNow } from '@atcute/tid';
import { get } from 'svelte/store';

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

    async uploadPage(
        path: string,
        pageContents: string,
        existingCid?: string,
    ): Promise<{ rkey: string; cid: At.CID; uri: At.Uri; }> {
        const pageBinary = new TextEncoder().encode(pageContents);
        const mimeType = 'text/plain';

        const blob = await this.agent.uploadBlob(new Blob([pageContents], { type: mimeType }));

        const rkey = tidNow();

        const result = await this.agent.put({
            collection: 'io.github.atweb.file',
            repo: this.user.did,
            rkey,
            swapCommit: existingCid,
            record: {
                $type: 'io.github.atweb.file',
                body: blob,
                filePath: path,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString(),
            }
        });

        return { ...result, rkey };
    }
}
