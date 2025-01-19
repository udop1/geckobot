import { Client, Events } from 'discord.js';
import { EventExport } from 'types/EventTypes';

const readyEvent: EventExport = {
	name: Events.ClientReady,
	once: true,

	execute(client: Client) {
		if (client.user) {
			console.log(`${client.user.tag} is online.`);
		} else {
			console.error('Client user is not defined yet.');
		}
	},
};

export default readyEvent;
