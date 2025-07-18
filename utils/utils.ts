export const checkEnv = (name: string): string => {
	if (typeof process.env[name] === 'undefined') {
		throw new Error(`Environment variable '${name}' is undefined.`);
	}

	return process.env[name];
};
