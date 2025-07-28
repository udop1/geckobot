import {
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder,
	SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';
import { RowDataPacket } from 'mysql2';

export interface CommandExport {
	data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
	execute: any;
}

export interface CommandModule {
	default: CommandExport;
}

export interface SelectViewReminders extends RowDataPacket {
	id: number;
	message: string;
	createdAt: number;
	remindAt: number;
	repeatInterval?: number | null;
	messageUrl: string;
}

export interface SelectDeleteReminder extends RowDataPacket {
	id: number;
	message: string;
	remindAt: number;
	repeatInterval?: number | null;
}
