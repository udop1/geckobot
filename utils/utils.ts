import { Queue } from 'distube';

export const numberWithCommas = (number: number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const queueStatus = (queue: Queue) => {
	let repeatModeStatus: 'All Queue' | 'This Song' | 'OFF';

	if (queue.repeatMode === 2) {
		repeatModeStatus = 'All Queue';
	} else if (queue.repeatMode === 1) {
		repeatModeStatus = 'This Song';
	} else {
		repeatModeStatus = 'OFF';
	}

	return `**Volume:** \`${queue.volume}%\` | **Filters:** \`${queue.filters.names.join(', ') || 'OFF'}\` | **Loop:** \`${repeatModeStatus}\` | **Autoplay:** \`${queue.autoplay ? 'ON' : 'OFF'}\``;
};
