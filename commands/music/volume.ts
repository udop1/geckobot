import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';
import { queueStatus } from 'utils/utils';

const volumeCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('volume')
		.setDescription('Sets the player volume.')
		.addIntegerOption((option) =>
			option
				.setName('volume')
				.setDescription('Enter new volume value to set.')
				.setRequired(true),
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client: Client, interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		const volume = interaction.options.getInteger('volume');

		try {
			queue.setVolume(volume);

			const volumeEmbed = new EmbedBuilder()
				.setDescription(`Volume changed to \`${volume}\`\n\n${queueStatus(queue)}`)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [volumeEmbed] });
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

export default volumeCommand;
