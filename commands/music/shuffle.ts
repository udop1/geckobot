import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';

const shuffleCommand: CommandExport = {
	data: new SlashCommandBuilder().setName('shuffle').setDescription('Shuffles the queue song.'),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client: Client, interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		try {
			await queue.shuffle();

			const shuffleEmbed = new EmbedBuilder()
				.setDescription('Shuffled songs in the queue')
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [shuffleEmbed] });
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

export default shuffleCommand;
