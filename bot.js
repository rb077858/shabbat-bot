const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');

const client = new Client();
const DATA_FILE = 'tasks.json';
const BASE_URL = 'https://shabbat-bot.onrender.com'; // נשנה לאחר פרסום האתר

function loadData() {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}');
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function shortenLink(url) {
    try {
        const res = await axios.get(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(url)}`);
        return res.data;
    } catch (err) {
        console.error(err);
        return url;
    }
}

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => console.log('🕯️ בוט שבת מוכן'));

client.on('message', async msg => {
    const text = msg.body.trim();
    const userId = msg.from;

    let data = loadData();
    if (!data[userId]) data[userId] = [];
    let tasks = data[userId];

    if (text === 'רשימה') {
        let reply = '📋 המשימות שלך:\n';
        tasks.forEach((t, i) => reply += `${i + 1}. ${t.done ? '✔️' : '⬜'} ${t.name}\n`);

        const longUrl = `${BASE_URL}/?user=${encodeURIComponent(userId)}`;
        const shortUrl = await shortenLink(longUrl);
        reply += `\n🔗 ניהול באתר:\n${shortUrl}`;

        msg.reply(reply);
    } else if (text === 'איפוס') {
        data[userId] = [];
        saveData(data);
        msg.reply('🧹 הרשימה אופסה');
    } else if (text.startsWith('בוצע ')) {
        const name = text.slice(5).trim();
        const task = tasks.find(t => t.name === name);
        if (!task) return msg.reply('❌ לא נמצאה משימה');
        task.done = true;
        saveData(data);
        msg.reply(`✔️ סומן כבוצע: ${name}`);
    } else {
        tasks.push({ name: text, done: false });
        saveData(data);
        msg.reply(`✅ נוספה משימה: ${text}`);
    }
});

client.initialize();
