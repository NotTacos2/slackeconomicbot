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
    const wallet = await db.get(`wallet_${id}`) || 0;
    db.add(`wallet_${id}`, 30)
    await respond({ text: `Granted $30 into your wallet!`});
});

app.command("/notdankmemer-balance", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    await respond({ text: `Your have $${wallet} in your wallet and $${bank} in your bank account`});
});

app.command("/notdankmemer-repeat", async ({command, ack, respond}) => {
    await ack();
    const args = command.text.split(' ').slice();
    if (!args[0]) {
        await respond({ text: "Arg not detected"});
        return;
    }
    await respond({ text: `${args[0]}`});
});

app.command("/notdankmemer-deposit", async ({command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const args = command.text.split(' ').slice();
    if (!args[0]) {
        await respond({ text: "Please input the amount of money that you want to deposit!"});
        return;
    }
    if (args[0] < 0) {
        await respond({ text: "You can't do less than 0!" });
        return;
    }
    if (args[0] > wallet) {
        await respond({ text: "You don't have enough to deposit" });
        return;
    }
    await db.add(`bank_${id}`, args[0]);
    await db.sub(`wallet_${id}`, args[0])
    await respond({ text: `Successfully deposited $${args[0]} into your bank account.`});
});

app.command("/notdankmemer-withdraw", async ({command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const args = command.text.split(' ').slice();
    if (!args[0]) {
        await respond({ text: "Please input the amount of money that you want to withdraw!"});
        return;
    }
    if (args[0] < 0) {
        await respond({ text: "You can't do less than 0!" });
        return;
    }
    if (args[0] > bank) {
        await respond({ text: "You don't have enough to withdraw" });
        return;
    }
    await db.sub(`bank_${id}`, args[0]);
    await db.add(`wallet_${id}`, args[0]);
    await respond({ text: `Successfully withdrawed $${args[0]} into your wallet.`});
});

app.command("/notdankmemer-coinflip", async ({command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const args = command.text.split(' ').slice();
    if (args[0] !== "heads" && args[0] !== "tails") {
        await respond({ text: "Heads or Tails? (Make sure it's lowercased)"});
        return;
    }
    if (!args[1]) {
        await respond({ text: "Please input the amount of money that you want to gamble after heads or tails!"});
        return;
    }
    if (args[1] < 0) {
        await respond({ text: "You can't do less than 0!"});
        return;
    }
    if (args[1] > bank) {
        await respond({ text: "You don't have enough in your bank account, make sure to deposit some!"});
        return;
    }
    const random = Math.round(Math.random());
    const result = random ? "heads" : "tails";
    if (args[0] === result) {
        await db.add(`bank_${id}`, args[1]);
        await respond({ text: `Congrats, you have won $${args[1]}! It has been deposited in your bank account.` });
        return;
    } else {
        await db.sub(`bank_${id}`, args[1]);
        await respond({ text: `Oof, you have lost $${args[1]} in your bank account.` });
        return;
    }
});

(async () => {
    await app.start();
    console.log("bot is running!")
})();