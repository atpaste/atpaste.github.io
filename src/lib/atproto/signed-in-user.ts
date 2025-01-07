import type { At } from '@atcute/client/lexicons';

import { type KittyAgent, StatefulOAuthClient } from 'kitty-agent';
import { AtpasteClient } from './atpaste-client';
import { derived, writable, type Readable } from 'svelte/store';

export interface LoginState {
    readonly handle: string;
    readonly did: At.DID;
    readonly pds: string;
    readonly agent: KittyAgent;
    readonly client: AtpasteClient;
}

const oauthClient: StatefulOAuthClient<AtpasteClient> = new StatefulOAuthClient<AtpasteClient>(
    {
        clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
        redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
        scope: import.meta.env.VITE_OAUTH_SCOPE,
    },
    writable,
    derived,
    (loginState) => new AtpasteClient(loginState),
);

export async function authenticateIfNecessary(handle: string, refreshOnly: boolean): Promise<boolean> {
    return await oauthClient.authenticateIfNecessary(handle, refreshOnly);
}
export async function waitForInitialSession(): Promise<void> {
    return await oauthClient.waitForInitialSession();
}
export function revokeSessions() {
    return oauthClient.revokeSessions();
}

export const user: Readable<LoginState | undefined> = oauthClient.user;
export const savedHandle: Readable<string | undefined> = oauthClient.handle;