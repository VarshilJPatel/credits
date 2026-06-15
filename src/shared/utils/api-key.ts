export const generateApiKey = () =>
	`api_key_${crypto.randomUUID().replaceAll("-", "")}`;
