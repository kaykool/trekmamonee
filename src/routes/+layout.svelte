<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
  import Header from '$lib/components/layout/Header.svelte';
  import BottomNav from '$lib/components/layout/BottomNav.svelte';
  import FAB from '$lib/components/layout/FAB.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="relative min-h-screen w-full bg-bg-light dark:bg-bg-dark selection:bg-primary/30">
  <Header />
  
  <main class="mx-auto w-full max-w-2xl px-4 py-6">
    {@render children()}
  </main>
  
  <FAB />
  <BottomNav />
</div>
