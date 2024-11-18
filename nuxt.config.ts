// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: [
		'nuxt-mapbox', 
		"@nuxt/ui",
	],
	devtools: { enabled: false },
	vite: {
		define: {
			'process.env.DEBUG': false,
		},
	},
	mapbox: {
		accessToken: 'pk.eyJ1IjoicmlraXNhYmUiLCJhIjoiY2xpYWM4MTZiMDF2aDNqbXE2YTl5ajh0NCJ9.JjjjSt0aDejclb9xNddA_w'
	},
	compatibilityDate: '2024-08-21'
})