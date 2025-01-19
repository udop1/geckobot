import { EmbedBuilder } from 'discord.js';
import { Events, Playlist, Queue } from 'distube';
import { EventExport } from 'types/EventTypes';

const distubeAddListEvent: EventExport = {
	name: Events.ADD_LIST,
	distube: true,

	async execute(queue: Queue, playlist: Playlist) {
		const embed = new EmbedBuilder()
			.setDescription(
				`New playlist to the queue\n**Playlist:** [${playlist.name}](${playlist.url}) (${playlist.songs.length} songs)`,
			)
			.setFooter({
				text: `Commanded by ${playlist.songs[0].user.tag}`,
				iconURL: playlist.songs[0].user.displayAvatarURL({ size: 1024 }),
			});

		await queue.textChannel?.send({ embeds: [embed] });
	},
};

export default distubeAddListEvent;
