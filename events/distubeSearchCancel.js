const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "searchCancel",
	distube: true,

	async execute(message) {
		const embed = new EmbedBuilder().setDescription("Searching canceled").setFooter({
			text: `Commanded by ${message.author.tag}`,
			iconURL: message.author.displayAvatarURL({ size: 1024 }),
		});

		await message.reply({ embeds: [embed] });
	},
};
