<script>
    import { configureOAuth, finalizeAuthorization } from '@atcute/oauth-browser-client';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';

    onMount(async () => {
        configureOAuth({
            metadata: {
                client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
                redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
            },
        });

        const params = new URLSearchParams(document.location.hash.slice(1));

        await finalizeAuthorization(params);

        goto('/');
    });
</script>
