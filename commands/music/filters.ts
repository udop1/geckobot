import { SlashCommandBuilder, EmbedBuilder, Client, ChatInputCommandInteraction } from 'discord.js';
import { Queue } from 'distube';
import { CommandExport } from 'types/CommandTypes';
import { queueStatus } from 'utils/utils';

const filtersCommands: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('filter')
		.setDescription('Applies different audio filters.')
		.addStringOption((option) =>
			option
				.setName('filter')
				.setDescription('Select any filter you want to ON/OFF.')
				.setChoices(
					{ name: 'OFF', value: 'off' },
					{ name: '3D', value: '3d' },
					{ name: 'BassBoost', value: 'bassboost' },
					{ name: 'Earwax', value: 'earwax' },
					{ name: 'Echo', value: 'echo' },
					{ name: 'Flanger', value: 'flanger' },
					{ name: 'Gate', value: 'gate' },
					{ name: 'Haas', value: 'haas' },
					{ name: 'Karaoke', value: 'karaoke' },
					{ name: 'Mcompand', value: 'mcompand' },
					{ name: 'NightCore', value: 'nightcore' },
					{ name: 'Phaser', value: 'phaser' },
					{ name: 'Reverse', value: 'reverse' },
					{ name: 'Surround', value: 'surround' },
					{ name: 'Tremolo', value: 'tremolo' },
					{ name: 'VaporWave', value: 'vaporwave' },
				)
				.setRequired(true),
		),
	memberVoice: true,
	botVoice: true,
	sameVoice: true,
	queueNeeded: true,

	async execute(client: Client, interaction: ChatInputCommandInteraction, queue: Queue) {
		await interaction.deferReply();

		const filter = interaction.options.getString('filter').toLowerCase();

		try {
			if (filter === 'off' && queue.filters.size) {
				queue.filters.clear();
			} else if (Object.keys(client.distube.filters).includes(filter)) {
				if (queue.filters.has(filter)) {
					queue.filters.remove(filter);
				} else {
					queue.filters.add(filter);
				}
			}

			const filtersEmbed = new EmbedBuilder()
				.setDescription(
					`**Current Queue Filters:** \`${
						queue.filters.names.join(', ') || 'OFF'
					}\`\n\n${queueStatus(queue)}`,
				)
				.setFooter({
					text: `Commanded by ${interaction.user.tag}`,
					iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
				});

			return await interaction.editReply({ embeds: [filtersEmbed] });
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

export default filtersCommands;
