import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';

const previousCommand: CommandExport = {
	data: new SlashCommandBuilder().setName('previous').setDescription('Plays previous song.'),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		try {
			await queue.previous();

			const skippedEmbed = new EmbedBuilder()
				.setDescription('Swapping back to the previous song.')
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

export default previousCommand;
