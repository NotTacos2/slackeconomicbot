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

app.command("/notdankmemer-balance", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    await respond({ text: `Your have $${wallet} in your wallet and $${bank} in your bank account`});
});

app.command("/notdankmemer-shop", async ({ command, ack, respond}) => {
    await ack();
    await respond({ text: "Shop: $10000 for fishing rod and 5 baits (a), $1000 for 3 baits (b), and $5000 for a shovel (c). Tip: Type /notdankmemer-buy (a or b or c) to buy a item from the shop!" });
});

app.command("/notdankmemer-buy", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const fishingrod = await db.get(`fish_${id}`) || 0;
    const shovel = await db.get(`shovel_${id}`) || 0;
    const args = command.text.split(' ').slice();
    if (!args[0]) {
        await respond({ text: "Please give the letter of the item that you want to buy in shop! Use /notdankmemer-shop to browse the item's letter and price." });
        return;
    }
    if (args[0] !== "a" && args[0] !== "b" && args[0] !== "c") {
        await respond({ text: "Invalid choice, make sure the items letters are lowercased!" });
        return;
    }
    if (args[0] === "a") {
        if (bank < 10000) {
            await respond({ text: "You can't afford it, make sure to deposit in your bank if you have the money!"});
            return;
        }
        if (fishingrod === 1) {
            await respond({ text: "You already have a fishing rod! If you want to buy bait, buy item B."});
            return;
        }
        await db.sub(`bank_${id}`, 10000);
        await db.add(`bait_${id}`, 5);
        await db.add(`fish_${id}`, 1);
        await respond({ text: "Successfully bought items for $10000, thank you for your purchase!" });
        return;
    }
    if (args[0] === "b") {
        if (bank < 1000) {
            await respond({ text: "You can't afford it, make sure to deposit in your bank if you have the money!"});
            return;
        }
        if (fishingrod === 0) {
            await respond({ text: "You don't have a fishing rod to buy this, make sure to buy a fishing rod first!" });
            return;
        }
        await db.sub(`bank_${id}`, 1000);
        await db.add(`bait_${id}`, 3);
        await respond({ text: "Successfully bought items for $1000, thank you for your purchase!" });
        return;
    }
    if (args[0] === "c") {
        if (bank < 5000) {
            await respond({ text: "You can't afford it, make sure to deposit in your bank if you have the money!"});
            return;
        }
        if (shovel === 1) {
            await respond({ text: "You already have a shovel!" });
            return;
        }
        await db.sub(`bank_${id}`, 5000);
        await db.add(`shovel_${id}`, 1);
        await respond({ text: "Successfully bought shovel for $5000, thank you for your purchase!" });
        return;
    }
});

app.command("/notdankmemer-items", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const commonfish = await db.get(`commonfish_${id}`) || 0;
    const rarefish = await db.get(`rarefish_${id}`) || 0;
    const legendaryfish = await db.get(`legendaryfish_${id}`) || 0;
    const commonartifact = await db.get(`commonartifact_${id}`) || 0;
    const rareartifact = await db.get(`rareartifact_${id}`) || 0;
    const legendaryartifact = await db.get(`legendaryartifact_${id}`) || 0;
    await respond({ text: `You have ${commonfish} common fishes (ID: cf), ${rarefish} rare fishes (ID: rf), ${legendaryfish} legendary fishes (ID: lf), ${commonartifact} common artifacts (ID: ca), ${rareartifact} rare artifacts (ID: ra), ${legendaryartifact} legendary artifacts (ID: la).`});
});

app.command("/notdankmemer-sell", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const args = command.text.split(' ').slice();
    const commonfish = await db.get(`commonfish_${id}`) || 0;
    const rarefish = await db.get(`rarefish_${id}`) || 0;
    const legendaryfish = await db.get(`legendaryfish_${id}`) || 0;
    const commonartifact = await db.get(`commonartifact_${id}`) || 0;
    const rareartifact = await db.get(`rareartifact_${id}`) || 0;
    const legendaryartifact = await db.get(`legendaryartifact_${id}`) || 0;
    if (!args[0]) {
        await respond({ text: "Please input the item id that you want to sell! (Get item ids by /notdankmemer-items)"});
        return;
    }
    if (args[0] !== "cf" && args[0] !== "rf" && args[0] !== "lf" && args[0] !== "ca" && args[0] !== "ra" && args[0] !== "la") {
        await respond({ text: "Invalid Item ID, make sure to get item ids by using /notdankmemer-items!"});
        return;
    }
    if (!args[1]) {
        await respond({ text: "Please input how much you would like to sell!" });
        return;
    }
    if (args[1] <= 0) {
        await respond({ text: "You cannot sell less than 0 or equal to 0!" });
        return;
    }
    if (args[0] === "cf" && args[1] > commonfish) {
        await respond({ text: "You don't have that amount of common fish!" });
        return;
    }
    if (args[0] === "rf" && args[1] > rarefish) {
        await respond({ text: "You don't have that amount of rare fish!" });
        return;
    }
    if (args[0] === "lf" && args[1] > legendaryfish) {
        await respond({ text: "You don't have that amount of legendary fish!" });
        return;
    }
    if (args[0] === "ca" && args[1] > commonartifact) {
        await respond({ text: "You don't have that amount of common artifact!" });
        return;
    }
    if (args[0] == "ra" && args[1] > rareartifact) {
        await respond({ text: "You don't have that amount of rare artifact!" });
        return;
    }
    if (args[0] == "la" && args[1] > legendaryartifact) {
        await respond({ text: "You don't have that amount of legendary artifact!" });
        return;
    }
    if (args[0] === "cf") {
        await db.sub(`commonfish_${id}`, args[1]);
        await db.add(`bank_${id}`, (500 * args[1]));
        await respond({ text: `You have sold total of ${args[1]} of common fishes for $${(500 * args[1])}! The money will be in your bank account.` });
        return;
    }
    if (args[0] === "rf") {
        await db.sub(`rarefish_${id}`, args[1]);
        await db.add(`bank_${id}`, (3000 * args[1]));
        await respond({ text: `You have sold total of ${args[1]} of rare fishes for $${(3000 * args[1])}! The money will be in your bank account.` });
        return;
    }
    if (args[0] === "lf") {
        await db.sub(`legendaryfish_${id}`, args[1]);
        await db.add(`bank_${id}`, (15000 * args[1]));
        await respond({ text: `You have sold total of ${args[1]} of legendary fishes for $${(15000 * args[1])}! The money will be in your bank account.` });
        return;
    }
    if (args[0] === "ca") {
        await db.sub(`commonartifact_${id}`, args[1]);
        await db.add(`bank_${id}`, (300 * args[1]));
        await respond({ text: `You have sold total of ${args[1]} of common artifacts for $${(300 * args[1])}! The money will be in your bank account.` });
        return;
    }
    if (args[0] === "ra") {
        await db.sub(`rareartifact_${id}`, args[1]);
        await db.add(`bank_${id}`, (1500 * args[1]));
        await respond({ text: `You have sold total of ${args[1]} of rare artifacts for $${(1500 * args[1])}! The money will be in your bank account.` });
        return;
    }
    if (args[0] === "la") {
        await db.sub(`legendaryartifact_${id}`, args[1]);
        await db.add(`bank_${id}`, (10000 * args[1]));
        await respond({ text: `You have sold total of ${args[1]} of legendary artifacts for $${(10000 * args[1])}! The money will be in your bank account.` });
        return;
    }
});

app.command("/notdankmemer-fish", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const fisher = await db.get(`fish_${id}`) || 0;
    const baits = await db.get(`bait_${id}`) || 0;
    if (fisher === 0) {
        await respond({ text: "You don't have a fishing rod, go get a fishing rod from the shop!"});
        return;
    }
    if (baits === 0) {
        await respond({ text: "You don't have any baits, go get some baits from the shop!"});
        return;
    }
    if (Math.random() < 0.9) { // since we need a 1% chance we kinda need to include else ifs
        await db.add(`commonfish_${id}`, 1);
        await db.sub(`bait_${id}`, 1);
        await respond({ text: "Congrats, you fished and got a common fish!"});
        return;
    } else if (Math.random() < 0.99) {
        await db.add(`rarefish_${id}`, 1);
        await db.sub(`bait_${id}`, 1);
        await respond({ text: "Wow, you fished and got a rare fish!!"});
        return;
    } else {
        await db.add(`legendaryfish_${id}`, 1);
        await db.sub(`bait_${id}`, 1);
        await respond({ text: "OMG!! You fished and got a LEGENDARY FISH!!!!"});
        return;
    }
});

app.command("/notdankmemer-dig", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const shovel = await db.get(`shovel_${id}`) || 0;
    const digcooldown = await db.get(`digcooldown_${id}`) || 0;
    if (shovel === 0) {
        await respond({ text: "You don't have a shovel, go get a shovel from the shop!"});
        return;
    }
    if (digcooldown > Date.now()) {
        const timeremain = digcooldown - Date.now();
        const seconds = Math.floor(( timeremain / 1000) % 60);
        await respond({ text: `Please wait until ${seconds} seconds to dig artifacts again.`});
        return;
    }
    if (Math.random() < 0.9) {
        await db.add(`commonartifact_${id}`, 1);
        await db.set(`digcooldown_${id}`, Date.now() + 60 * 1000);
        await respond({ text: "Congrats, you dug and got a common artifact!"});
        return;
    } else if (Math.random() < 0.99) {
        await db.add(`rareartifact_${id}`, 1);
        await db.set(`digcooldown_${id}`, Date.now() + 60 * 1000);
        await respond({ text: "Wow, you dug and got a rare artifact!!"});
        return;
    } else {
        await db.add(`legendaryartifact_${id}`, 1);
        await db.set(`digcooldown_${id}`, Date.now() + 60 * 1000);
        await respond({ text: "OMG!! You dug and got a LEGENDARY ARTIFACT!!!"});
        return;
    }
});

app.command("/notdankmemer-beg", async ({ command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const begcooldown = await db.get(`begcooldown_${id}`) || 0;
    if (begcooldown > Date.now()) {
        const timeremain = begcooldown - Date.now();
        const seconds = Math.floor(( timeremain / 1000) % 60);
        await respond({ text: `Please wait until ${seconds} seconds to use the beg command again.`});
        return;
    }
    const money = Math.floor(Math.random() * (500 - 10 + 1)) + 10; // very random equation
    await db.add(`wallet_${id}`, money);
    await db.set(`begcooldown_${id}`, Date.now() + 60 * 1000);
    await respond({ text: `You have begged for hours and got $${money}`});
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
    if (args[0] <= 0) {
        await respond({ text: "You can't do less or equal to 0!" });
        return;
    }
    if (args[0] > wallet) {
        await respond({ text: "You don't have enough to deposit" });
        return;
    }
    await db.add(`bank_${id}`, args[0]);
    await db.sub(`wallet_${id}`, args[0]);
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
    if (args[0] <= 0) {
        await respond({ text: "You can't do less or equal to 0!" });
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
    if (!args[0]) {
        await respond({ text: "Please put heads or tails as your coin to flip (Make sure it's lowercased)"});
        return;
    }
    if (args[0] !== "heads" && args[0] !== "tails") {
        await respond({ text: "Heads or Tails? (Make sure it's lowercased)"});
        return;
    }
    if (!args[1]) {
        await respond({ text: "Please input the amount of money that you want to gamble after heads or tails!"});
        return;
    }
    if (args[1] <= 0) {
        await respond({ text: "You can't do less or equal to 0!"});
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

app.command("/notdankmemer-daily", async ({command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const cooldown = await db.get(`dailycooldown_${id}`) || 0;
    if (cooldown > Date.now()) {
        const timeremain = cooldown - Date.now();
        const hours = Math.floor(( timeremain / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor(( timeremain / (1000 * 60)) % 60);
        await respond({ text: `You already have claimed your daily money! Come back in ${hours} hours and ${minutes} minutes.`});
        return;
    }
    await db.add(`bank_${id}`, 500);
    await db.set(`dailycooldown_${id}`, Date.now() + 24 * 60 * 60 * 1000);
    await respond({ text: "You have claimed your daily $500!" });
});

app.command("/notdankmemer-weekly", async ({command, ack, respond}) => {
    await ack();
    const id = command.user_id;
    const wallet = await db.get(`wallet_${id}`) || 0;
    const bank = await db.get(`bank_${id}`) || 0;
    const cooldown = await db.get(`weeklycooldown_${id}`) || 0;
    if (cooldown > Date.now()) {
        const timeremain = cooldown - Date.now();
        const days = Math.floor( timeremain / (1000 * 60 * 60 * 24));
        const hours = Math.floor(( timeremain / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor(( timeremain / (1000 * 60)) % 60);
        await respond({ text: `You already have claimed your weekly money! Come back in ${days} days, ${hours} hours and ${minutes} minutes.`});
        return;
    }
    await db.add(`bank_${id}`, 3500);
    await db.set(`weeklycooldown_${id}`, Date.now() + 7 * 24 * 60 * 60 * 1000 );
    await respond({ text: "You have claimed your weekly $3500!" });
});

(async () => {
    await app.start();
    console.log("bot is running!")
})();
