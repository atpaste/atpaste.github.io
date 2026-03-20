<script>
    import { configureOAuth, finalizeAuthorization } from '@atcute/oauth-browser-client';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    import {
        CompositeDidDocumentResolver,
        LocalActorResolver,
        PlcDidDocumentResolver,
        WebDidDocumentResolver,
        XrpcHandleResolver,
    } from '@atcute/identity-resolver';


    onMount(async () => {
        configureOAuth({
            metadata: {
                client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
                redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URIS
                    .split(',')
                    .find(uri => document.location.host === new URL(uri).host) ?? import.meta.env.VITE_OAUTH_REDIRECT_URIS.split(',')[0],
            },
            identityResolver: new LocalActorResolver({
                handleResolver: new XrpcHandleResolver({
                    serviceUrl: 'https://public.api.bsky.app',
                }),
                didDocumentResolver: new CompositeDidDocumentResolver({
                    methods: {
                        plc: new PlcDidDocumentResolver(),
                        web: new WebDidDocumentResolver(),
                    },
                }),
            }),
        });

        const params = new URLSearchParams(document.location.hash.slice(1));

        await finalizeAuthorization(params);

        goto('/');
    });
</script>
