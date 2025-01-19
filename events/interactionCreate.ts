import { Client, CommandInteraction, Events, GuildMember, MessageFlags } from 'discord.js';
import { CommandExport } from 'types/CommandTypes';
import { EventExport } from 'types/EventTypes';

const interactionCreateEvent: EventExport = {
	name: Events.InteractionCreate,

	async execute(...args: any) {
		const interaction: CommandInteraction = args.find(
			(item: any): item is CommandInteraction => {
				return item instanceof CommandInteraction;
			},
		);
		const client: Client = interaction.client;

		const command: CommandExport = client.commands.get(interaction.commandName);
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
					flags: MessageFlags.Ephemeral,
				});
			}
		}
		if (command.botVoice) {
			if (!botVC) {
				return await interaction.reply({
					content: "I'm not connected to any Voice Channel.",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
		if (command.sameVoice) {
			if (memberVC && botVC && memberVC.id !== botVC.id) {
				return await interaction.reply({
					content: "You aren't connected to my Voice Channel.",
					flags: MessageFlags.Ephemeral,
				});
			}
		}
		if (command.queueNeeded) {
			if (!queue) {
				return await interaction.reply({
					content: "I'm not playing anything right now.",
					flags: MessageFlags.Ephemeral,
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
