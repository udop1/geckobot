const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "addList",
	distube: true,

	async execute(queue, playlist) {
		const embed = new EmbedBuilder()
			.setDescription(
				`New playlist to the queue\n**Playlist:** ${playlist.name} (${playlist.songs.length} songs)`
			)
			.setFooter({
				text: `Commanded by ${playlist.songs[0].user.tag}`,
				iconURL: playlist.songs[0].user.displayAvatarURL({ size: 1024 }),
			});

		await queue.textChannel?.send({ embeds: [embed] });
	},
};
