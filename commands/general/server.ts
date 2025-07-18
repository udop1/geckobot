import { Client, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CommandExport } from 'types/CommandTypes';

const serverCommand: CommandExport = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Allows you to get info about the server'),

	async execute(_client: Client, interaction: CommandInteraction) {
		await interaction.deferReply();
		await interaction.editReply({
			content: `This server's name is: ${interaction.guild?.name}\nTotal Members: ${interaction.guild?.memberCount}\nCreated at: ${interaction.guild?.createdAt}`,
		});
	},
};

export default serverCommand;
