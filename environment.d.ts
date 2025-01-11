declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			HOST: string;
			USER: string;
			PASSWORD: string;
			DATABASE: string;
		}
	}
}

export {};
