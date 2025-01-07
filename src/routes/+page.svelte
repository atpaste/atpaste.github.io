<script lang="ts">
    import { onMount } from 'svelte';

    import CodeCup from '@calumk/codecup';
    import { authenticateIfNecessary, revokeSessions, savedHandle, user, waitForInitialSession } from '$lib/atproto/signed-in-user';
    import { get } from 'svelte/store';
    import { goto } from '$app/navigation';
    import { encryptData, generatePassphrase } from '$lib/crypto';

    let value = $state(localStorage.value ?? `# Welcome to Atpaste!

This is a paste that stores everything in your PDS, on the ATmosphere.

Try typing something, then hit Share!

(Note: To delete pastes, you'll have to use https://github.com/ziodotsh/atfile.)

(Note: The editor's text is also stored in your browser's local storage.)`);

    let urlInput = $state('');
    let downloadFileName = $state('');
    let isEncrypted = $state(localStorage.isEncrypted ?? false);
    let flask = $state<CodeCup>();
    let language = $state(localStorage.language ?? 'markdown');
    let languages = [
        'abap',
        'abnf',
        'actionscript',
        'ada',
        'agda',
        'al',
        'antlr4',
        'apacheconf',
        'apex',
        'apl',
        'applescript',
        'aql',
        'arduino',
        'arff',
        'armasm',
        'arturo',
        'asciidoc',
        'asm6502',
        'asmatmel',
        'aspnet',
        'autohotkey',
        'autoit',
        'avisynth',
        'avro-idl',
        'awk',
        'bash',
        'basic',
        'batch',
        'bbcode',
        'bbj',
        'bicep',
        'birb',
        'bison',
        'bnf',
        'bqn',
        'brainfuck',
        'brightscript',
        'bro',
        'bsl',
        'c',
        'cfscript',
        'chaiscript',
        'cil',
        'cilkc',
        'cilkcpp',
        'clike',
        'clojure',
        'cmake',
        'cobol',
        'coffeescript',
        'concurnas',
        'cooklang',
        'coq',
        'cpp',
        'crystal',
        'csharp',
        'cshtml',
        'csp',
        'css',
        'css-extras',
        'csv',
        'cue',
        'cypher',
        'd',
        'dart',
        'dataweave',
        'dax',
        'dhall',
        'diff',
        'django',
        'dns-zone-file',
        'docker',
        'dot',
        'ebnf',
        'editorconfig',
        'eiffel',
        'ejs',
        'elixir',
        'elm',
        'erb',
        'erlang',
        'etlua',
        'excel-formula',
        'factor',
        'false',
        'firestore-security-rules',
        'flow',
        'fortran',
        'fsharp',
        'ftl',
        'gap',
        'gcode',
        'gdscript',
        'gedcom',
        'gettext',
        'gherkin',
        'git',
        'glsl',
        'gml',
        'gn',
        'go',
        'go-module',
        'gradle',
        'graphql',
        'groovy',
        'haml',
        'handlebars',
        'haskell',
        'haxe',
        'hcl',
        'hlsl',
        'hoon',
        'hpkp',
        'hsts',
        'http',
        'ichigojam',
        'icon',
        'icu-message-format',
        'idris',
        'iecst',
        'ignore',
        'inform7',
        'ini',
        'io',
        'j',
        'java',
        'javadoc',
        'javadoclike',
        'javascript',
        'javastacktrace',
        'jexl',
        'jolie',
        'jq',
        'js-extras',
        'js-templates',
        'jsdoc',
        'json',
        'json5',
        'jsonp',
        'jsstacktrace',
        'jsx',
        'julia',
        'keepalived',
        'keyman',
        'kotlin',
        'kumir',
        'kusto',
        'latex',
        'latte',
        'less',
        'lilypond',
        'linker-script',
        'liquid',
        'lisp',
        'livescript',
        'llvm',
        'log',
        'lolcode',
        'lua',
        'magma',
        'makefile',
        'markdown',
        'markup',
        'markup-templating',
        'mata',
        'matlab',
        'maxscript',
        'mel',
        'mermaid',
        'metafont',
        'mizar',
        'mongodb',
        'monkey',
        'moonscript',
        'n1ql',
        'n4js',
        'nand2tetris-hdl',
        'naniscript',
        'nasm',
        'neon',
        'nevod',
        'nginx',
        'nim',
        'nix',
        'nsis',
        'objectivec',
        'ocaml',
        'odin',
        'opencl',
        'openqasm',
        'oz',
        'parigp',
        'parser',
        'pascal',
        'pascaligo',
        'pcaxis',
        'peoplecode',
        'perl',
        'php',
        'php-extras',
        'phpdoc',
        'plaintext',
        'plant-uml',
        'plsql',
        'powerquery',
        'powershell',
        'processing',
        'prolog',
        'promql',
        'properties',
        'protobuf',
        'psl',
        'pug',
        'puppet',
        'pure',
        'purebasic',
        'purescript',
        'python',
        'q',
        'qml',
        'qore',
        'qsharp',
        'r',
        'racket',
        'reason',
        'regex',
        'rego',
        'renpy',
        'rescript',
        'rest',
        'rip',
        'roboconf',
        'robotframework',
        'ruby',
        'rust',
        'sas',
        'sass',
        'scala',
        'scheme',
        'scss',
        'shell-session',
        'smali',
        'smalltalk',
        'smarty',
        'sml',
        'solidity',
        'solution-file',
        'soy',
        'sparql',
        'splunk-spl',
        'sqf',
        'sql',
        'squirrel',
        'stan',
        'stata',
        'stylus',
        'supercollider',
        'swift',
        'systemd',
        't4-cs',
        't4-templating',
        't4-vb',
        'tap',
        'tcl',
        'textile',
        'toml',
        'tremor',
        'tsx',
        'tt2',
        'turtle',
        'twig',
        'typescript',
        'typoscript',
        'unrealscript',
        'uorazor',
        'uri',
        'v',
        'vala',
        'vbnet',
        'velocity',
        'verilog',
        'vhdl',
        'vim',
        'visual-basic',
        'warpscript',
        'wasm',
        'web-idl',
        'wgsl',
        'wiki',
        'wolfram',
        'wren',
        'xeora',
        'xml-doc',
        'xojo',
        'xquery',
        'yaml',
        'yang',
        'zig',
    ];
    let initialSessionPromise: Promise<void> | undefined = $state();
    
    $effect(() => {
        localStorage.value = value;
        localStorage.isEncrypted = isEncrypted;
        localStorage.language = language;
    });

    $effect(() => {
        flask?.updateLanguage(language)
    })

    onMount(() => {
        initialSessionPromise = waitForInitialSession();

        processContent(); // Update urlInput and download link

        flask = new CodeCup('#text', {
            language: 'ruby',
            defaultTheme: false,
            maxLines: Infinity,
        });
        console.log(flask);

        // How to listen for changes on your editor
        flask.onUpdate((code) => {
            value = code;
        });

        flask.updateCode(value);

        return () => {
            flask?.dispose();
            flask = undefined;
        };
    });

    function processContent() {
        if (typeof document === 'undefined') return;

        document.title = title();
    }

    let f: number | NodeJS.Timeout;
    function contentChanged() {
        clearInterval(f);
        f = setTimeout(function () {
            processContent();
        }, 500);
    }

    function title() {
        return value ? value.slice(0, 30) : 'Atbin';
    }
    
    async function share(event: Event) {
        event.preventDefault();

        const theUser = get(user);
        if (!theUser) {
            return;
        }

        if (isEncrypted) {
            const { rkey, passphrase } = await theUser.client.uploadEncryptedPaste(value);

            goto(`/${theUser.did}/${rkey}.${language}/${passphrase}`);
        } else {
            const { rkey } = await theUser.client.uploadPaste(value);

            goto(`/${theUser.did}/${rkey}.${language}`);
        }
    }

    async function signIn(event: Event) {
        event.preventDefault();

        if (!get(user)) {
            await waitForInitialSession();
        }

        if (!get(user)) {
            const handle = get(savedHandle) ?? prompt('What\'s your @handle?');
            if (!handle) return;

            await authenticateIfNecessary(handle, false);
        }
    }

    function clear(event: Event) {
        event.preventDefault();

        value = '';
        return false;
    }

    function signOut() {
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
            <a href="javascript: void 0" role="button" onclick={share}>Share</a> |
            <a href="javascript: void 0" role="button" onclick={clear}>New</a> |
            <a href="javascript: void 0" role="button" onclick={signOut}>Sign Out</a>
        {:else}
            <a href="javascript: void 0" role="button" onclick={clear}>New</a>
            {#if initialSessionPromise}
                {#await initialSessionPromise}
                    <!-- empty -->
                {:then _}
                    | <a href="javascript: void 0" role="button" onclick={signIn}>Sign In</a>
                {/await}
            {/if}
        {/if}

        <input type="text" id="urlInput" bind:value={urlInput} />
    </div>
    <div id="text"></div>
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
