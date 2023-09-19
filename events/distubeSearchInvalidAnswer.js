const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "searchInvalidAnswer",
	distube: true,

	async execute(message) {
		const embed = new EmbedBuilder().setDescription("Invalid number of result.").setFooter({
			text: `Commanded by ${message.author.tag}`,
			iconURL: message.author.displayAvatarURL({ size: 1024 }),
		});

		await message.reply({ embeds: [embed] });
	},
};
