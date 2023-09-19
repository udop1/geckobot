const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const func = require("../../utils/utils");

module.exports = {
	data: new SlashCommandBuilder().setName("autoplay").setDescription("Toggles auto play."),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client, interaction, memberVC, botVC, queue) {
		await interaction.deferReply();

		try {
			const autoPlayState = await queue.toggleAutoplay();

			const autoplayEmbed = new EmbedBuilder()
				.setDescription(
					`Auto Play mode changed to \`${
						autoPlayState ? "ON" : "OFF"
					}\`\n\n${func.queueStatus(queue)}`
				)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [autoplayEmbed] });
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
