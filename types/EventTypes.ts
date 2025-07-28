import { ClientEvents } from 'discord.js';
import { RowDataPacket } from 'mysql2';

// Type for exporting events
export interface EventExport {
	name: keyof ClientEvents;
	once?: boolean;
	execute: any;
}

export interface EventModule {
	default: EventExport;
}

export interface SelectFinishedReminders extends RowDataPacket {
	id: number;
	userId: string;
	channelId: string;
	message: string;
	createdAt: number;
	remindAt: number;
	repeatInterval?: number | null;
	messageUrl: string;
}
