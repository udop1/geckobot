const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "addSong",
	distube: true,

	async execute(queue, song) {
		const embed = new EmbedBuilder()
			.setDescription(
				`New song added to the queue\n**Song:** [${song.name} (${song.formattedDuration})](${song.url})`
			)
			.setFooter({
				text: `Commanded by ${song.user.tag}`,
				iconURL: song.user.displayAvatarURL({ size: 1024 }),
			});

		await queue.textChannel?.send({ embeds: [embed] });
	},
};
