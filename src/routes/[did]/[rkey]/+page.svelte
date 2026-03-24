<script lang="ts">
    import { page } from '$app/state';
    import { downloadEncryptedPaste, downloadPaste } from '$lib/atproto/unauthed-client';
    import type { Did } from '@atcute/lexicons';
    import type { AtUri } from '@atproto/syntax';

    import { createLowlight, common } from 'lowlight';
    import { Unist } from '@typematter/svelte-unist';
    import { components as hastComponents } from '@typematter/svelte-hast';
    import type { Root } from 'hast';
    import { onMount } from 'svelte';

    const lowlight = createLowlight(common);

	const did = page.params.did;
    const [rkey, language] = page.params.rkey!.split('.');
    const cryptoKey = document.location.hash.slice(1);

    let pre: HTMLPreElement;

    let result = $state<{ uri: AtUri; text: string; tree?: Root }>();
    let error = $state<string>();

    onMount(() => {
        const pastePromise = cryptoKey
            ? downloadEncryptedPaste(did as Did, rkey, cryptoKey)
            : downloadPaste(did as Did, rkey);

        pastePromise.then((paste) => {
            let tree: Root | undefined;
            try {
                if (lowlight.registered(language)) {
                    tree = lowlight.highlight(language, paste.text);
                }
            } catch {
                // fall back to plain text
            }
            result = { ...paste, tree };
        }).catch((err) => {
            error = String(err);
        });
    })
</script>

<pre bind:this={pre} id="pre" class="codecup wrappy">{#if error
    }{error}{:else if result
    }{#if result.tree}<code class="hljs language-{language}"><Unist ast={result.tree} components={hastComponents} /></code>{:else}{result.text}{/if}{:else
    }Loading...{/if}</pre>

<style lang="scss">
    .wrappy {
        white-space: pre-wrap;
    }
</style>