import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';

const skiptoCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('skipto')
		.setDescription('Skips to the provided song ID in the queue.')
		.addIntegerOption((option) =>
			option
				.setName('song-id')
				.setDescription('Enter the song ID you want skip to.')
				.setRequired(true),
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		const songId = interaction.options.getInteger('song-id');

		try {
			await queue.jump(songId).then(async (song) => {
				const skippedEmbed = new EmbedBuilder()
					.setDescription(
						`Skipped to the **${songId}. [${song.name} (${song.formattedDuration})](${song.url})**`,
					)
					.setFooter({
						text: `Commanded by ${interaction.user.tag}`,
						iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
					});

				return await interaction.editReply({ embeds: [skippedEmbed] });
			});
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

export default skiptoCommand;
