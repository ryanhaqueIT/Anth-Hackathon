export const CIcon = {
	caret: () => (
		<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
			<path d="M2.5 4.5L6 8l3.5-3.5" />
		</svg>
	),
	export: () => (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 3v12M7 8l5-5 5 5M5 21h14" />
		</svg>
	),
	filter: () => (
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
			<path d="M3 5h18l-7 9v6l-4-2v-4z" />
		</svg>
	),
	arrow: () => (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M5 12h14M13 5l7 7-7 7" />
		</svg>
	),
	trend: ({ up }: { up: boolean }) => (
		<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
			<path d={up ? "M5 17L12 10l4 4 5-5M16 9h5v5" : "M5 7L12 14l4-4 5 5M16 15h5v-5"} />
		</svg>
	),
	check: () => (
		<svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
			<path d="M2 6.5L5 9.5L10 3.5" />
		</svg>
	),
};
