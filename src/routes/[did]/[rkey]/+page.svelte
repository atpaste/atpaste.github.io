<script lang="ts">
    import { page } from '$app/state';
    import { downloadEncryptedPaste, downloadPaste } from '$lib/atproto/unauthed-client';
    import type { At } from '@atcute/client/lexicons';

    import Prism from 'prismjs';
    import 'prismjs/plugins/autoloader/prism-autoloader';
    import { onMount } from 'svelte';

    const languagesPath = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
    const useMinified = false;
    
	/**
	 * @param {string} lang
	 * @returns {string}
	 */
	function getLanguagePath(lang: string): string {
		return `${languagesPath}prism-${lang}${useMinified ? '.min' : ''}.js`;
	}

	function addScript(src: string) {
        return new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.async = true;
            s.onload = () => {
                document.body.removeChild(s);
                resolve();
            };
            s.onerror = () => {
                document.body.removeChild(s);
                reject();
            };
            document.body.appendChild(s);
        });
    }

    Prism.manual = true;

	const did = page.params.did;
    const [rkey, language] = page.params.rkey.split('.');
    const cryptoKey = document.location.hash.slice(1);

    let pre: HTMLPreElement;

    let promise = $state<Promise<{ uri: string; text: string; } | { uri: string; html: string; }>>();

    onMount(() => {
        promise = Promise.allSettled([
            addScript(getLanguagePath(language)),
            cryptoKey
                ? downloadEncryptedPaste(did as At.DID, rkey, cryptoKey)
                : downloadPaste(did as At.DID, rkey)
        ]).then(([addScriptResult, pasteResult]) => {
            if (pasteResult.status === 'rejected') throw new Error(pasteResult.reason);
            if (addScriptResult.status !== 'rejected') {
                return {
                    uri: pasteResult.value.uri,
                    html: Prism.highlight(pasteResult.value.text, Prism.languages[language], language),
                };
            }
            return pasteResult.value;
        });
    })

</script>

<pre bind:this={pre} id="pre" class="codecup">{#if promise
}{#await promise
    }Loading...{:then file
    }{#if 'text' in file}{file.text}{:else}{@html file.html}{/if}{/await
}{/if}</pre>