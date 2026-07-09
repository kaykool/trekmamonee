// Entry point for cPanel / LiteSpeed / Passenger to load ESM SvelteKit build
import('./build/index.js').catch(err => {
	console.error('Failed to start SvelteKit app:', err);
});
