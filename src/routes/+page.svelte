<script lang="ts">
    import { onMount } from 'svelte';

    // biome-ignore lint/style/useImportType: biome bug
    import CodeCup from '$lib/vendor/codecup/CodeCup.svelte';
    import { authenticateIfNecessary, revokeSessions, savedHandle, user, waitForInitialSession } from '$lib/atproto/signed-in-user';
    import { goto } from '$app/navigation';
    import grammars from '$lib/languages';

    const defaultValue = `# Welcome to Atpaste!

This is a pastebin that stores everything in your PDS, on the ATmosphere.

Try typing something, then hit *Share*!

(Note: The editor's text is also stored in your browser's local storage.)

Credits:

- https://github.com/captbaritone/hashbin, which this is transparently based on
- https://github.com/toptal/haste-server, which hashbin was based on
 
Created by @uwx https://github.com/uwx`;

    let value = $state<string>(localStorage.value ?? defaultValue);

    let isEncrypted = $state<boolean>(localStorage.isEncrypted ?? false);
    let flask: CodeCup | undefined;
    let language = $state<string>(localStorage.language ?? 'markdown');
    let languages = Object.keys(grammars);
    let initialSessionPromise = $state<Promise<void>>();
    
    $effect(() => {
        if (value !== defaultValue && value.trim() !== '')
            localStorage.value = value;
        localStorage.isEncrypted = isEncrypted;
        localStorage.language = language;
    });

    onMount(() => {
        initialSessionPromise = waitForInitialSession();

        processContent(); // Update urlInput and download link
    });

    function processContent() {
        if (typeof document === 'undefined') return;

        document.title = title();
    }

    let f: number | NodeJS.Timeout;
    function contentChanged() {
        clearInterval(f);
        f = setTimeout(() => {
            processContent();
        }, 500);
    }

    function title() {
        return value.trim() && !value.startsWith('# Welcome to Atpaste!') ? value.slice(0, 30) : '@paste';
    }
    
    async function share(event: Event) {
        event.preventDefault();

        const theUser = $user;
        if (!theUser) {
            return;
        }

        if (isEncrypted) {
            const { rkey, passphrase } = await theUser.client.uploadEncryptedPaste(value);

            goto(`/${theUser.did}/${rkey}.${language}#${passphrase}`);
        } else {
            const { rkey } = await theUser.client.uploadPaste(value);

            goto(`/${theUser.did}/${rkey}.${language}`);
        }
    }

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

    function clear(event: Event) {
        event.preventDefault();

        value = '';
        return false;
    }

    function signOut(event: Event) {
        event.preventDefault();

        revokeSessions();
    }
</script>

<div class="main">
    <div id="tools">
        <input type="checkbox" name="is-encrypted" bind:checked={isEncrypted} />
        <label for="is-encrypted">Encrypted?</label> |
        <select bind:value={language}>
            {#each languages as language}
                <option value={language}>{language}</option>
            {/each}
        </select> |

        {#if $user}
            <a href="#share" role="button" onclick={share}>Share</a> |
            <a href="#clear" role="button" onclick={clear}>New</a> |
            <a href="/manage" role="button">Manage Pastes & Uploads</a> |
            <a href="/atbox" role="button">Upload Files</a> |
            <a href="#signOut" role="button" onclick={signOut}>Sign Out</a>
        {:else}
            <a href="#clear" role="button" onclick={clear}>New</a>
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
        <CodeCup
            bind:this={flask}
            bind:code={value}
            {language}
            defaultTheme='dark'
            minLines={25}
            maxLines={Infinity}
            onupdate={(code) => { value = code; }}
            grammars={grammars}
        />
    </div>
</div>

<style lang="scss">
    input[type="checkbox"] {
        vertical-align: bottom;
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
    input[type="text"] {
        display: none;
        margin-top: 5px;
        width: 100%;
        border: 1px solid #4195d2;
        padding: 5px;
        border-radius: 3px;
    }

    :global(.codecup) {
        background: none !important;
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
