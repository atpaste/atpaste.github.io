<script lang="ts">
	const { children } = $props();

    import '../styles/index.scss';
</script>

<svelte:head>
    <title>@paste</title>
</svelte:head>

{@render children()}