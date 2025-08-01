import { TextChannel } from 'discord.js';
import {
	SlashCommandBuilder,
	PermissionFlagsBits,
	ChatInputCommandInteraction,
	MessageFlags,
	Client,
} from 'discord.js';
import { CommandExport } from 'types/CommandTypes';

const pruneCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Use the prune command to remove 1 to 99 messages')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.addIntegerOption((option) =>
			option
				.setName('amount')
				.setDescription('Number of messages to remove')
				.setRequired(true),
		),

	async execute(_client: Client, interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const amount = interaction.options.getInteger('amount');

		if (amount === null || isNaN(amount)) {
			return interaction.editReply({
				content: "That doesn't seem to be a valid number.",
			});
		}
		if (amount <= 1 || amount > 100) {
			return interaction.editReply({
				content: 'You need to input a number between 1 and 99.',
			});
		}

		await (interaction.channel as TextChannel)
			?.bulkDelete(amount, true)
			.catch((error: Error) => {
				console.error(error);
				interaction.editReply({
					content: 'There was an error trying to prune messages in this channel!',
				});
			});

		return interaction.editReply({
			content: `Successfully removed \`${amount}\` messages.`,
		});
	},
};

export default pruneCommand;
