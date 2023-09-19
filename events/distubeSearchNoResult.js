const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "searchNoResult",
	distube: true,

	async execute(message) {
		const embed = new EmbedBuilder().setDescription("No result found!").setFooter({
			text: `Commanded by ${message.author.tag}`,
			iconURL: message.author.displayAvatarURL({ size: 1024 }),
		});

		await message.reply({ embeds: [embed] });
	},
};
