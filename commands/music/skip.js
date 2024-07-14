const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('skip').setDescription('Skips the current song.'),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();

		try {
			if (queue.songs.length <= 1) {
				await queue.stop();
				await queue.voice.leave();
			} else {
				await queue.skip();
			}

			const skippedEmbed = new EmbedBuilder()
				.setDescription('Skipping to the next song.')
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [skippedEmbed] });
		} catch (error) {
			const errorEmbed = new EmbedBuilder()
				.setDescription(
					error.message.length > 4096
						? error.message.slice(0, 4093) + '...'
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
