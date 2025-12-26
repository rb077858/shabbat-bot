const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const DATA_FILE = 'tasks.json';

app.use(bodyParser.json());
app.use(express.static('public'));

function loadData() {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}');
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/tasks', (req, res) => {
    const user = req.query.user;
    const data = loadData();
    res.json(data[user] || []);
});

app.post('/api/tasks', (req, res) => {
    const { user, tasks } = req.body;
    const data = loadData();
    data[user] = tasks;
    saveData(data);
    res.json({ ok: true });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('🌐 Server running');
});
