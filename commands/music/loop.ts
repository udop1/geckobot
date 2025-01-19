import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Client } from 'discord.js';
import { Queue, RepeatMode } from 'distube';
import { CommandExport } from 'types/CommandTypes';
import { queueStatus } from 'utils/utils';

const loopCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('loop')
		.setDescription('Changes loop mode.')
		.addStringOption((option) =>
			option
				.setName('mode')
				.setDescription('loop song or queue.')
				.setChoices(
					{ name: 'OFF', value: '0' },
					{ name: 'Song', value: '1' },
					{ name: 'Queue', value: '2' },
				)
				.setRequired(true),
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client: Client, interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		try {
			const selectedMode = Number(interaction.options.getString('mode'));
			let mode = queue.setRepeatMode(selectedMode);
			if (mode) {
				if (mode === 2) {
					mode = RepeatMode.QUEUE;
				} else {
					mode = RepeatMode.SONG;
				}
			} else {
				mode = RepeatMode.DISABLED;
			}

			const loopEmbed = new EmbedBuilder()
				.setDescription(`Loop mode changed to \`${mode}\`\n\n${queueStatus(queue)}`)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [loopEmbed] });
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

export default loopCommand;
