import { Collection } from 'discord.js';
import DisTube from 'distube';

// Extend Client to add commands as an attribute type
declare module 'discord.js' {
	export interface Client {
		commands: Collection<any, any>;
		distube: DisTube;
	}
}
