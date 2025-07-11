import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

export const checkEnv = (name: string): string => {
	if (typeof process.env[name] === 'undefined') {
		console.error(`Environment variable '${name}' is undefined.`);
		throw new Error(`Environment variable '${name}' is undefined.`);
	}

	return process.env[name];
};

export const parseDate = (input: string): number => {
	// Relative (e.g. "3d 15m")
	const pieces = [...input.matchAll(/(\d+)([smhdw])/gi)];

	if (pieces.length > 0) {
		const seconds = parseDuration(input);

		return Math.floor(new Date().getTime() / 1000 + seconds);
	}

	// Absolute, common formats
	const formats = [
		'DD/MM/YYYY HH:mm',
		'DD/MM/YYYY H:mm',
		'DD/MM HH:mm',
		'DD/MM H:mm',
		'HH:mm',
		'H:mm',
	];

	dayjs.extend(customParseFormat);

	for (const format of formats) {
		const dateTime = dayjs(input, format, true);

		if (dateTime.isValid()) return Math.floor(new Date(dateTime.toDate()).getTime() / 1000);
	}

	console.error('Invalid date format');
	throw new Error('Invalid date format');
};

export const parseDuration = (input: string): number => {
	const pieces = [...input.matchAll(/(\d+)([smhdw])/gi)];
	if (!pieces) {
		console.error('Invalid duration format');
		throw new Error('Invalid duration format');
	}

	// Check for duplicates
	const units = pieces.map(([, , unit]) => unit.toLowerCase());
	const hasDupes = new Set(units).size !== units.length;
	if (hasDupes) {
		console.error('No duplicate times');
		throw new Error('No duplicate times');
	}

	const multipliers: Record<string, number> = {
		s: 1,
		m: 60,
		h: 60 * 60,
		d: 24 * 60 * 60,
		w: 7 * 24 * 60 * 60,
	};

	return pieces.reduce((total, [, amountStr, unit]) => {
		const amount = Number(amountStr);
		const key = unit.toLowerCase();

		if (!(key in multipliers)) {
			console.error(`Unknown unit: ${unit}`);
			throw new Error(`Unknown unit: ${unit}`);
		}

		return total + amount * multipliers[key];
	}, 0);
};
