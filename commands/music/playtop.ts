import {
	SlashCommandBuilder,
	EmbedBuilder,
	Client,
	ChatInputCommandInteraction,
	VoiceBasedChannel,
	GuildMember,
	MessageFlags,
} from 'discord.js';
import { CommandExport } from 'types/CommandTypes';

const playtopCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('playtop')
		.setDescription('Plays the song before other songs in the queue.')
		.addStringOption((option) =>
			option
				.setName('query')
				.setDescription('Enter song name or playlist list.')
				.setRequired(true),
		),
	memberVoice: true,
	botVoice: false,
	sameVoice: true,
	queueNeeded: false,

	async execute(
		client: Client,
		interaction: ChatInputCommandInteraction,
		memberVC: VoiceBasedChannel,
	) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const query = interaction.options.getString('query');

		const searchEmbed = new EmbedBuilder().setDescription('Searching...').setFooter({
			text: `Commanded by ${interaction.user.tag}`,
			iconURL: interaction.user.displayAvatarURL({ size: 1024 }),
		});

		await interaction.editReply({ embeds: [searchEmbed] });

		try {
			await client.distube.play(memberVC, query, {
				member: interaction.member as GuildMember,
				textChannel: interaction.channel,
				position: 1,
			});

			await interaction.deleteReply();
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

export default playtopCommand;
