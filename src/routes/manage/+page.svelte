<script lang="ts">
    import type { AtpasteClient } from '$lib/atproto/atpaste-client';
    import { authenticateIfNecessary, revokeSessions, savedHandle, user, waitForInitialSession } from '$lib/atproto/signed-in-user';
    import type { At } from '@atcute/client/lexicons';
    import { onMount } from 'svelte';

    let initialSessionPromise = $state<Promise<void>>();
    let listPastesPromise = $state<ReturnType<AtpasteClient['listPastes']>>();
    
    onMount(async () => {
        initialSessionPromise = waitForInitialSession();

        listPastesPromise = initialSessionPromise.then(() => {
            if ($user) {
                return $user.client.listPastes();
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

    async function deletePaste(rkeyAndCid: { rkey: string, cid: At.CID }, event: Event) {
        event.preventDefault();

        if ($user && confirm('Are you sure you wish to delete this paste?')) {
            await $user.client.deletePaste(rkeyAndCid.rkey, rkeyAndCid.cid);
            listPastesPromise = $user.client.listPastes();
        }
    }
</script>

<div class="main">
    <div id="tools">
        {#if $user}
            <a href="/" role="button">New</a> |
            <a href="javascript: void 0" role="button" onclick={signOut}>Sign Out</a>
        {:else}
            <a href="/" role="button">New</a> |
            {#if initialSessionPromise}
                {#await initialSessionPromise}
                    <!-- empty -->
                {:then _}
                    | <a href="javascript: void 0" role="button" onclick={signIn}>Sign In</a>
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
                        {#if !paste.isEncrypted}
                            <a href="/{$user.did}/{paste.rkey}.plaintext">{paste.rkey}</a>
                        {:else}
                            {paste.rkey} (Encrypted)
                        {/if}
                        <a href="javascript: void 0" role="button" onclick={event => deletePaste(paste, event)}>
                            🗑️
                        </a>
                    </p>
                {/each}
            {/await}
        {/if}
    </div>
</div>

<style lang="scss">
    input[type="checkbox"] {
        vertical-align: text-bottom;
    }

    .main,
    textarea,
    input[type="text"],
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
        padding: 60px 30px 30px 30px;
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
    input[type="text"] {
        display: none;
        margin-top: 5px;
        width: 100%;
        border: 1px solid #4195d2;
        padding: 5px;
        border-radius: 3px;
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
