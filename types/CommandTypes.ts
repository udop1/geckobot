import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface CommandExport {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
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

export interface AllReleases {
	release_name: string;
	release_date: string;
	release_date_sort: string;
}
