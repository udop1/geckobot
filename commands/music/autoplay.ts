import { EmbedBuilder, SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';
import { queueStatus } from 'utils/utils';

const autoplayCommand: CommandExport = {
	data: new SlashCommandBuilder().setName('autoplay').setDescription('Toggles auto play.'),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		try {
			const autoPlayState = queue.toggleAutoplay();

			const autoplayEmbed = new EmbedBuilder()
				.setDescription(
					`Auto Play mode changed to \`${
						autoPlayState ? 'ON' : 'OFF'
					}\`\n\n${queueStatus(queue)}`,
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
						? error.message.slice(0, 4093) + '...'
						: error.message,
				)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [errorEmbed] });
		}
	},
};

export default autoplayCommand;
