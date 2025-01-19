import { EmbedBuilder } from 'discord.js';
import { Events, Queue } from 'distube';
import { EventExport } from 'types/EventTypes';

const distubeNoRelatedEvent: EventExport = {
	name: Events.NO_RELATED,
	distube: true,

	async execute(queue: Queue) {
		const embed = new EmbedBuilder().setDescription("I can't find any related song to play.");

		await queue.textChannel?.send({ embeds: [embed] });
	},
};

export default distubeNoRelatedEvent;
