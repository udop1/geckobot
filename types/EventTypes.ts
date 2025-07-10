import { ClientEvents } from 'discord.js';

// Type for exporting events
export interface EventExport {
	name: keyof ClientEvents;
	once?: boolean;
	execute: any;
}

export interface EventModule {
	default: EventExport;
}

// Type for finished reminders
export interface FinishedReminders {
	reminder_id: number;
	username: string;
	reminder: string;
	start_time: number;
	recurrence_time: number;
	end_duration: number;
	channel_in: string;
	message_url: string;
	is_recurring: string;
}
