require("dotenv").config();

const { App } = require("@slack/bolt");
const { QuickDB } = require("quick.db")

const db = new QuickDB();

const app = new App({
    token: process.env.bottoken,
    appToken: process.env.apptoken,
    socketMode: true
});

app.command("/notdankmemer-ping", async ({ command, ack, respond }) => {
    const start = Date.now();
    await ack();
    const latency = Date.now() - start;
    await respond({ text: `Pong!\nLatency: ${latency}ms`});
});

app.command("/notdankmemer-grant", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const money = await db.get(`money_${id}`) || 0;
    db.add(`money_${id}`, 30)
    await respond({ text: `Granted $30!`});
});

app.command("/notdankmemer-balance", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const money = await db.get(`money_${id}`) || 0;
    await respond({ text: `Your have $${money} in your account`});
});

(async () => {
    await app.start();
    console.log("bot is running!")
})();