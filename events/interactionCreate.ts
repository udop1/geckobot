import { BaseInteraction, Client, Events, GuildMember } from 'discord.js';
import { CommandExport } from 'types/CommandTypes';
import { EventExport } from 'types/EventTypes';

const interactionCreateEvent: EventExport = {
	name: Events.InteractionCreate,

	async execute(client: Client, interaction: BaseInteraction) {
		if (!interaction.isChatInputCommand()) return;

		const command: CommandExport = interaction.client.commands.get(interaction.commandName);
		const interactionMember = interaction.member as GuildMember;
		const memberVC = interactionMember.voice.channel || null;
		const botVC = interaction.guild.members.me.voice.channel || null;
		const queue = client.distube.getQueue(interaction.guild) || null;

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		// Distube
		if (command.memberVoice) {
			if (!memberVC) {
				return await interaction.reply({
					content: "You aren't connected to any Voice Channel.",
					ephemeral: true,
				});
			}
		}
		if (command.botVoice) {
			if (!botVC) {
				return await interaction.reply({
					content: "I'm not connected to any Voice Channel.",
					ephemeral: true,
				});
			}
		}
		if (command.sameVoice) {
			if (memberVC && botVC && memberVC.id !== botVC.id) {
				return await interaction.reply({
					content: "You aren't connected to my Voice Channel.",
					ephemeral: true,
				});
			}
		}
		if (command.queueNeeded) {
			if (!queue) {
				return await interaction.reply({
					content: "I'm not playing anything right now.",
					ephemeral: true,
				});
			}
		}

		try {
			await command.execute(client, interaction, memberVC, botVC, queue);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}:\n${error}`);
		}
	},
};

export default interactionCreateEvent;