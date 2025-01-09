import { Events, Queue } from 'distube';
import { EventExport } from 'types/EventTypes';

const distubeFinishEvent: EventExport = {
	name: Events.FINISH,
	distube: true,

	execute(queue: Queue) {
		queue.voice.leave();
	},
};

export default distubeFinishEvent;
