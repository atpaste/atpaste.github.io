<script lang="ts">
    import { page } from '$app/state';
    import { downloadEncryptedPaste, downloadPaste } from '$lib/atproto/unauthed-client';
    import type { At } from '@atcute/client/lexicons';

    import remarkParse from 'remark-parse';
    import { unified } from 'unified';
    import remarkRehype from 'remark-rehype';
    import rehypeExpressiveCode, { type RehypeExpressiveCodeOptions } from 'rehype-expressive-code';
    import rehypeSanitize from 'rehype-sanitize';
    import rehypeStringify from 'rehype-stringify';

    import { onMount } from 'svelte';
    import type { AtUri } from '@atproto/syntax';

	const did = page.params.did;
    const [rkey, language] = page.params.rkey.split('.');
    const cryptoKey = document.location.hash.slice(1);

    let pre: HTMLPreElement;

    let promise = $state<Promise<{ uri: AtUri; html: string; }>>();

    export async function renderMarkdown(markdown: string) {
        const vfile = await unified()
            .use(remarkParse)
            .use(remarkRehype)
            .use(rehypeSanitize)
            .use(rehypeExpressiveCode, {
            } satisfies RehypeExpressiveCodeOptions)
            .use(rehypeStringify)
            .process(markdown);

        return String(vfile);
    }

    onMount(() => {
        promise = (async () => {
            const paste = cryptoKey
                ? await downloadEncryptedPaste(did as At.DID, rkey, cryptoKey)
                : await downloadPaste(did as At.DID, rkey);

            return { uri: paste.uri, html: await renderMarkdown(paste.text) };
        })();
    })

    import "@picocss/pico/css/pico.blue.css";
</script>

<main class="container">
    {#if promise}{#await promise}Loading...{:then file}{@html file.html}{/await}{/if}
</main>

<style>
    /* undo +layout.svelte styles */
    :global(body) {
        -webkit-tap-highlight-color: transparent;
        -webkit-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        text-size-adjust: 100%;
        background-color: var(--pico-background-color);
        color: var(--pico-color);
        font-weight: var(--pico-font-weight);
        font-size: var(--pico-font-size);
        line-height: var(--pico-line-height);
        font-family: var(--pico-font-family);
        text-underline-offset: var(--pico-text-underline-offset);
        text-rendering: optimizeLegibility;
        overflow-wrap: break-word;
        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;
    }
</style>
