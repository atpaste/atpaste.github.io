<script lang="ts">
    import type { AtpasteClient } from '$lib/atproto/atpaste-client';
    import { formatGetBlobUrl } from '$lib/atproto/blob-utils';
    import {
        authenticateIfNecessary,
        revokeSessions,
        savedHandle,
        user,
        waitForInitialSession,
    } from '$lib/atproto/signed-in-user';
    import type { At } from '@atcute/client/lexicons';
    import { onMount } from 'svelte';
    import Dropzone from 'svelte-file-dropzone';

    let files: {
        file: File,
        uploadPromise: ReturnType<AtpasteClient['uploadFile']>
    }[] = $state([]);

    function handleFilesSelect(e: CustomEvent<{ acceptedFiles: File[]; fileRejections: File[] }>) {
        const { acceptedFiles, fileRejections } = e.detail;
        if ($user) {
            files = [...files, ...acceptedFiles.map(file => ({
                file,
                uploadPromise: $user.client.uploadFile(file)
            }))];
        }
    }

    let initialSessionPromise = $state<Promise<void>>();
    let listPastesPromise = $state<ReturnType<AtpasteClient['listPastes']>>();

    onMount(async () => {
        initialSessionPromise = waitForInitialSession();
    });

    async function signIn(event: Event) {
        event.preventDefault();

        if (!$user) {
            await waitForInitialSession();
        }

        if (!$user) {
            const handle = $savedHandle ?? prompt("What's your @handle?");
            if (!handle) return;

            await authenticateIfNecessary(handle, false);
        }
    }

    function signOut(event: Event) {
        event.preventDefault();

        revokeSessions();
    }
</script>

<div class="main">
    <div id="tools">
        {#if $user}
            <a href="/" role="button">Home</a> |
            <a href="/manage" role="button">Manage Pastes & Uploads</a> |
            <a href="#signOut" role="button" onclick={signOut}>Sign Out</a>
        {:else}
            <a href="/" role="button">Home</a>
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
        {#if $user}
            <Dropzone on:drop={handleFilesSelect} disableDefaultStyles={true} multiple={true}>
                <div class="dropzone">
                    Drag and drop some files here, or click to select files
                </div>
            </Dropzone>

            {#each files as { file: item, uploadPromise: promise }}
                <p>
                    {#await promise}
                        {item.name}: (Uploading...)
                    {:then result} 
                        {item.name}: <a href="{formatGetBlobUrl(result.blob.pds, result.blob.did, result.blob.cid)}">{result.rkey}</a>
                    {/await}
                </p>
            {/each}
        {:else}
            <a href="#signIn" role="button" onclick={signIn}>Sign in</a> to upload files.
        {/if}
    </div>
</div>

<style lang="scss">
    .dropzone {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        border-width: 2px;
        border-radius: 2px;
        border-color: #eeeeee3c;
        border-style: dashed;
        background-color: #fafafa3c;
        outline: none;
        transition: border 0.24s ease-in-out;
        min-height: 250px;
        line-height: 250px;

        margin-top: 2rem;

        &:focus {
            border-color: #2196f3;
        }
    }

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
