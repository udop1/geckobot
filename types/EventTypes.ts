import { Events as DiscordEvents } from 'discord.js';
import { Events as DistubeEvents } from 'distube';

// Type for exporting events
export interface EventExport {
	name: DiscordEvents | DistubeEvents;
	once?: boolean;
	distube?: boolean;
	execute: any;
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
