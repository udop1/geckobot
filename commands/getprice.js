module.exports = {
    name: 'getprice',
    description: 'Get the price of a crypto',
    guildOnly: true,
    args: true,
    cooldown: 10,
    usage: '<ticker symbol>',
    async execute(message, args) {
        const {binance} = require('../index');
        const tickerSymbol = args[0].toUpperCase();

        await binance.prices(`${tickerSymbol}`, (error, ticker) => {
            try {
                message.reply(`Price of ${tickerSymbol}: ` + ticker[`${tickerSymbol}`]);
            } catch (error) {
                console.log(error);
                message.reply(`The ticker symbol \`${tickerSymbol}\` doesn't exist.`);
            }
        });
    },
};