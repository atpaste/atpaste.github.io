<script lang="ts">
    import type { AtpasteClient } from '$lib/atproto/atpaste-client';
    import { formatGetBlobUrl } from '$lib/atproto/blob-utils';
    import { authenticateIfNecessary, revokeSessions, savedHandle, user, waitForInitialSession } from '$lib/atproto/signed-in-user';
    import type { At } from '@atcute/client/lexicons';
    import { onMount } from 'svelte';

    let initialSessionPromise = $state<Promise<void>>();
    let listPastesPromise = $state<ReturnType<AtpasteClient['listPastesAndFiles']>>();
    
    onMount(async () => {
        initialSessionPromise = waitForInitialSession();

        listPastesPromise = initialSessionPromise.then(() => {
            if ($user) {
                return $user.client.listPastesAndFiles();
            }
            return [];
        });
    });

    async function signIn(event: Event) {
        event.preventDefault();

        if (!$user) {
            await waitForInitialSession();
        }

        if (!$user) {
            const handle = $savedHandle ?? prompt('What\'s your @handle?');
            if (!handle) return;

            await authenticateIfNecessary(handle, false);
        }
    }

    function signOut(event: Event) {
        event.preventDefault();

        revokeSessions();
    }

    async function deletePasteOrFile(rkeyAndCid: { rkey: string, cid: At.CID }, event: Event) {
        event.preventDefault();

        if ($user && confirm('Are you sure you wish to delete this paste?')) {
            await $user.client.deletePasteOrFile(rkeyAndCid.rkey, rkeyAndCid.cid);
            listPastesPromise = $user.client.listPastesAndFiles();
        }
    }
    // https://stackoverflow.com/a/3177838
    function timeSince(date: Date) {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;

        if (interval > 1) {
            return `${Math.floor(interval)} years`;
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return `${Math.floor(interval)} months`;
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return `${Math.floor(interval)} days`;
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return `${Math.floor(interval)} hours`;
        }
        interval = seconds / 60;
        if (interval > 1) {
            return `${Math.floor(interval)} minutes`;
        }
        return `${Math.floor(seconds)} seconds`;
    }
</script>

<div class="main">
    <div id="tools">
        {#if $user}
            <a href="/" role="button">New</a> |
            <a href="#signOut" role="button" onclick={signOut}>Sign Out</a>
        {:else}
            <a href="/" role="button">New</a>
            {#if initialSessionPromise}
                {#await initialSessionPromise}
                    <!-- empty -->
                {:then _}
                    | <a href="#signIn" role="button" onclick={signIn}>Sign In</a>
                {/await}
            {/if}
        {/if}
    </div>
    <div id="text">
        {#if $user && listPastesPromise}
            {#await listPastesPromise}
                Loading pastes...
            {:then pastes} 
                {#each pastes as paste}
                    <p>
                        {#if paste.isFile && paste.blob}
                            <a href="{formatGetBlobUrl($user.pds, $user.did, paste.blob?.ref.$link)}">{paste.rkey}</a> (File)
                        {:else}
                            {#if !paste.isEncrypted}
                                <a href="/{$user.did}/{paste.rkey}.plaintext">{paste.rkey}</a>
                            {:else}
                                {paste.rkey} (Encrypted)
                            {/if}
                        {/if}
                        uploaded {timeSince(paste.date)} ago
                        <a href="#deletePaste" role="button" onclick={event => deletePasteOrFile(paste, event)}>
                            🗑️
                        </a>
                    </p>
                {/each}
            {/await}
        {/if}
    </div>
</div>

<style lang="scss">
    .main,
    #tools {
        padding: 0;
        margin: 0;
    }
    #text {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        outline: none;
        border: none;
        box-sizing: border-box;
        padding: 100px 30px 30px 30px;
    }
    a {
        text-decoration: none;
        color: #4195d2;
    }
    #tools {
        text-align: center;
        padding: 40px;
        z-index: 1000;
        width: 100%;
        position: fixed;
        top: 0;
        box-sizing: border-box;
    }
    
    @media (min-width: 600px) {
        #tools {
            padding: 10px 50px 0 0;
            right: 0;
            width: auto;
            background: none;
        }
        #text {
            padding: 30px 50px 30px 50px;
        }
    }
</style>
