const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "noRelated",
	distube: true,

	async execute(queue) {
		const embed = new EmbedBuilder().setDescription("I can't find any related song to play.");

		await queue.textChannel?.send({ embeds: [embed] });
	},
};
