// Entry point for cPanel / LiteSpeed / Passenger to load ESM SvelteKit build
import('./index.js').catch(err => {
	console.error('Failed to start SvelteKit app:', err);
});
