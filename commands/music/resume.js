const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder().setName("resume").setDescription("Resumes the current song."),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();

		if (queue.playing) {
			const pauseEmbed = new EmbedBuilder().setDescription("Queue isn't paused.").setFooter({
				text: `Commanded by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
			});

			return await interaction.editReply({ embeds: [pauseEmbed] });
		}

		try {
			await queue.resume();

			const pauseEmbed = new EmbedBuilder()
				.setDescription("Resumed the song for you.")
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [pauseEmbed] });
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
