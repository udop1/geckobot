const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "empty",
	distube: true,

	async execute(queue) {
		const embed = new EmbedBuilder().setDescription(
			"The voice channel is empty! Leaving the voice channel."
		);

		await queue.textChannel?.send({ embeds: [embed] });
	},
};
