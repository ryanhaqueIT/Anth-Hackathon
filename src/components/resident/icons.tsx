export const Icon = {
	mic: ({ size = 28 }: { size?: number }) => (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
		</svg>
	),
	clock: ({ size = 14 }: { size?: number }) => (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
			<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
		</svg>
	),
	walk: ({ size = 14 }: { size?: number }) => (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="13" cy="4.5" r="1.8" /><path d="M9 21l2-7-3-2 2-5 4 2 3 4M7 14l-1 7" />
		</svg>
	),
	coin: ({ size = 14 }: { size?: number }) => (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
			<circle cx="12" cy="12" r="9" /><path d="M9 9c1-1 3-1 4 0s-1 2 0 3 3 1 4 0" />
		</svg>
	),
	pin: ({ size = 14 }: { size?: number }) => (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
			<path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12Z" /><circle cx="12" cy="9" r="2.4" />
		</svg>
	),
	settings: () => (
		<svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
		</svg>
	),
	help: () => (
		<svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
			<circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.3-1 1-1 1.7M12 17h.01" />
		</svg>
	),
	arrow: () => (
		<svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
			<path d="M5 12h14M13 5l7 7-7 7" />
		</svg>
	),
	back: () => (
		<svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
			<path d="M15 5l-7 7 7 7" />
		</svg>
	),
	phone: ({ size = 18 }: { size?: number }) => (
		<svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
			<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" />
		</svg>
	),
	phoneOff: () => (
		<svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M10.7 13.3a16 16 0 0 0 6 0M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3M2 2l20 20" />
		</svg>
	),
	heart: () => (
		<svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor">
			<path d="M12 21s-7-4.6-9.3-9.1C1 8.5 3.4 4 7.5 4c2.1 0 3.5 1.2 4.5 2.6C12.9 5.2 14.4 4 16.5 4 20.6 4 23 8.5 21.3 11.9 19 16.4 12 21 12 21Z" />
		</svg>
	),
	check: () => (
		<svg viewBox="0 0 24 24" width={36} height={36} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
			<path d="M4 12.5l5 5L20 7" />
		</svg>
	),
	bell: () => (
		<svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
			<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0" />
		</svg>
	),
};
