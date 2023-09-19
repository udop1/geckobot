const { EmbedBuilder } = require("discord.js");

module.exports = {
	name: "searchResult",
	distube: true,

	async execute(message, result) {
		let i = 0;

		const embed = new EmbedBuilder()
			.setTitle("Choose an option from below")
			.setDescription(
				`${result
					.map((song) => `**${++i}**. ${song.name} (${song.formattedDuration})`)
					.join("\n")}\n\n*Enter anything else or wait 30 seconds to cancel!*`
			)
			.setFooter({
				text: `Commanded by ${message.author.tag}`,
				iconURL: message.author.displayAvatarURL({ size: 1024 }),
			});

		await message.reply({ embeds: [embed] });
	},
};
