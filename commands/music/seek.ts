import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';

const seekCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('seek')
		.setDescription('Seeks the playing song.')
		.addIntegerOption((option) =>
			option.setName('time').setDescription('Time in seconds.').setRequired(true),
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		const time = interaction.options.getInteger('time');

		try {
			queue.seek(time);

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

export default seekCommand;
