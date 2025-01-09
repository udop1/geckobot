import { EmbedBuilder } from 'discord.js';
import { Events, Queue, Song } from 'distube';
import { EventExport } from 'types/EventTypes';

const distubeAddSongEvent: EventExport = {
	name: Events.ADD_SONG,
	distube: true,

	async execute(queue: Queue, song: Song) {
		const embed = new EmbedBuilder()
			.setDescription(
				`New song added to the queue\n**Song:** [${song.name} (${song.formattedDuration})](${song.url})`,
			)
			.setFooter({
				text: `Commanded by ${song.user.tag}`,
				iconURL: song.user.displayAvatarURL({ size: 1024 }),
			});

		await queue.textChannel?.send({ embeds: [embed] });
	},
};

export default distubeAddSongEvent;
