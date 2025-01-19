import { EmbedBuilder } from 'discord.js';
import { Events, Queue } from 'distube';
import { EventExport } from 'types/EventTypes';

const distubeEmptyEvent: EventExport = {
	name: Events.EMPTY,
	distube: true,

	async execute(queue: Queue) {
		const embed = new EmbedBuilder().setDescription(
			'The voice channel is empty! Leaving the voice channel.',
		);

		await queue.textChannel?.send({ embeds: [embed] });
	},
};

export default distubeEmptyEvent;
