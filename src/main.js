import Landing from './Landing.svelte';

const app = new Landing({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;