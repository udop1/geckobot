
function getCurrencyMultiplier(from, to) {
	const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from.toLowerCase()}/${to.toLowerCase()}.json`;
	const https = require('https');
	https.get(url, (resp) => {
	  let data = '';
	  
	  // A chunk of data has been received.
	  resp.on('data', (chunk) => {
		data += chunk;
	  });
	  
	  // The whole response has been received. Extract the currency value as a variable.
	  resp.on('end', () => {
		const apiResponse = JSON.parse(data);
		const currencyValue = apiResponse[to.toLowerCase()];
		console.log(`${to.toUpperCase()} multiplier:`, currencyValue);
	  });
	  
	}).on('error', (err) => {
	  console.log('Error: ' + err.message);
	});
  }

module.exports = {
	name: 'convert',
	description: 'Converts currency',
	options: [
		{
			name: "input",
			description: "What you want to convert from (e.g. \"USD 1\")",
			type: 3, //String
			required: true,
		},
		{
			name: "result",
			description: "What you want to convert to (e.g. \"GBP\")",
			type: 3, //String
			required: true,
		}],
		
	async execute(interaction) {
		await interaction.deferReply();
		let input_value = interaction.options.getString("input")
		let result_currency = interaction.options.getString("input")
		let match = input_value.match(/[a-zA-Z]+|\d+/g); // match letters and numbers separately
		let characters = match.filter(s => isNaN(s)).join(""); // join all matched letters
		let number = match.find(s => !isNaN(s)); // find the matched number
		final_result = getCurrencyMultiplier(characters, result_currency) * number;
		await interaction.editReply(final_result);
	}
	}