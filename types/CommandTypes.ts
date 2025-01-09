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
