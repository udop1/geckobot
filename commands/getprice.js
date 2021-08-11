module.exports = {
    name: 'getprice',
    description: 'Get the price of a crypto',
    options: [
        {
            name: "ticker",
            description: "Ticker Symbol",
            type: 3, //String
            required: true,
        },
    ],
    async execute(interaction) {
        const {binance} = require('../index');
        const tickerSymbol = interaction.options.getString('ticker').toUpperCase();

        await binance.prices(`${tickerSymbol}`, (error, ticker) => {
            try {
                interaction.reply(`Price of ${tickerSymbol}: ` + ticker[`${tickerSymbol}`]);
            } catch (error) {
                console.log(error);
                interaction.reply({ content: `The ticker symbol \`${tickerSymbol}\` doesn't exist.`, ephemeral: true });
            }
        });
    },
};