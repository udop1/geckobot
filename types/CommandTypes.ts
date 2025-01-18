import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface CommandExport {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	memberVoice?: boolean;
	botVoice?: boolean;
	sameVoice?: boolean;
	queueNeeded?: boolean;
	execute: any;
}

export interface CommandModule {
	default: CommandExport;
}

export interface AllReminders {
	reminder_id: number;
	reminder: string;
	start_time: number;
	end_duration: number;
	message_url: string;
	is_recurring: string;
}
