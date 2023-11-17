const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("seek")
		.setDescription("Seeks the playing song.")
		.addIntegerOption((option) =>
			option.setName("time").setDescription("Time in seconds.").setRequired(true)
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();

		const time = interaction.options.getInteger("time");

		try {
			await queue.seek(time);

			const seekEmbed = new EmbedBuilder()
				.setDescription(`Seeked to ${time} second of the song.`)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [seekEmbed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(
					error.message.length > 4096
						? error.message.slice(0, 4093) + "..."
						: error.message
				)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [errorEmbed] });
		}
	},
};
