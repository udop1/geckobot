import dayjs from 'dayjs';

export const parseDate = (input: string): Date => {
	// Relative (e.g. "3d", "15m")
	const relMatch = input.match(/^(\d+)([smhdw])$/);
	if (relMatch) {
		const ms = parseDuration(input);

		return new Date(Date.now() + ms);
	}

	// Absolute, common formats
	const formats = ['DD/MM/YYYY HH:mm', 'DD-MM-YYYY HH:mm', 'YYYY-MM-DD HH:mm'];

	for (const fmt of formats) {
		const dt = dayjs(input, fmt);

		if (dt.isValid()) return dt.toDate();
	}

	throw new Error('Invalid date format');
};

export const parseDuration = (input: string): number => {
	const match = input.match(/^(\d+)([smhdw])$/);

	if (!match) throw new Error('Invalid duration format');

	const value = Number(match[1]);
	const unit = match[2];
	const multipliers: Record<string, number> = {
		s: 1000,
		m: 60 * 1000,
		h: 60 * 60 * 1000,
		d: 24 * 60 * 60 * 1000,
		w: 7 * 24 * 60 * 60 * 1000,
	};

	return value * (multipliers[unit] || 0);
};

export const msToReadable = (ms: number): string => {
	const days = Math.floor(ms / (24 * 60 * 60 * 1000));
	const hrs = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
	const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
	const parts = [] as string[];

	if (days) parts.push(`${days}d`);
	if (hrs) parts.push(`${hrs}h`);
	if (mins) parts.push(`${mins}m`);

	return parts.length ? parts.join(' ') : `${ms}ms`;
};
