import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';

const stopCommand: CommandExport = {
	data: new SlashCommandBuilder().setName('stop').setDescription('Stops the queue.'),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		try {
			await queue.stop();
			queue.voice.leave();

			const stopEmbed = new EmbedBuilder().setDescription('Stopped playing.').setFooter({
				text: `Commanded by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
			});

			return await interaction.editReply({ embeds: [stopEmbed] });
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

export default stopCommand;
