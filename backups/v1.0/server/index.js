const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;
const DATA_FILE = path.join(__dirname, 'db.json');

// Initialize DB
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({
        users: {},
        groups: {},
        plan: {
            startDate: "2026-02-01",
            endDate: "2026-10-24",
            totalChapters: 1189,
            dailyTarget: 4
        }
    }, null, 2));
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

function readDB() {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeDB(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Login/Register
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const db = readDB();
    if (db.users[username]) {
        if (db.users[username].password === password) {
            return res.json({
                success: true,
                user: {
                    username,
                    group: db.users[username].group,
                    isAdmin: !!db.users[username].isAdmin
                }
            });
        }
        return res.status(401).json({ success: false, message: '비밀번호가 틀립니다.' });
    }
    // Register
    db.users[username] = {
        password,
        group: '교구',
        progress: 0,
        lastRead: '',
        dailyProgress: {},
        completedCount: 0
    };
    writeDB(db);
    res.json({ success: true, user: { username, group: '교구' } });
});

// Update Progress
app.post('/api/progress', (req, res) => {
    const { username, completed, lastRead, total, deltaChapters } = req.body;
    const db = readDB();
    if (db.users[username]) {
        // Calculate KST (UTC+9) today string robustly
        const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

        db.users[username].progress = Math.round((completed / total) * 100);
        db.users[username].lastRead = lastRead;
        db.users[username].completedCount = completed;

        // Track daily progress
        if (!db.users[username].dailyProgress) db.users[username].dailyProgress = {};
        db.users[username].dailyProgress[today] = (db.users[username].dailyProgress[today] || 0) + (deltaChapters || 0);

        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

// Get Group Progress
app.get('/api/group/:groupName', (req, res) => {
    const { groupName } = req.params;
    const db = readDB();
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' });

    const members = Object.keys(db.users)
        .filter(u => db.users[u].group === groupName)
        .map(u => ({
            username: u,
            progress: db.users[u].progress || 0,
            lastRead: db.users[u].lastRead || 'N/A',
            completedCount: db.users[u].completedCount || 0,
            todayCount: (db.users[u].dailyProgress && db.users[u].dailyProgress[today]) || 0,
            dailyProgress: db.users[u].dailyProgress || {},
            isAdmin: !!db.users[u].isAdmin
        }));
    res.json({ success: true, members });
});

app.post('/api/group/join', (req, res) => {
    const { username, groupName } = req.body;
    const db = readDB();
    if (db.users[username]) {
        db.users[username].group = groupName;
        writeDB(db);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false });
    }
});

app.delete('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const db = readDB();

    if (username.toLowerCase() === 'admin' || username === '김완주') {
        return res.status(403).json({ success: false, message: '보호된 사용자입니다.' });
    }

    if (!db.users[username]) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    delete db.users[username];
    writeDB(db);
    res.json({ success: true, message: '사용자가 삭제되었습니다.' });
});

app.post('/api/user/:username/role', (req, res) => {
    const { username } = req.params;
    const { isAdmin } = req.body;
    const db = readDB();

    if (username.toLowerCase() === 'admin' || username === '김완주') {
        return res.status(403).json({ success: false, message: '이 사용자의 권한은 변경할 수 없습니다.' });
    }

    if (!db.users[username]) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }

    db.users[username].isAdmin = isAdmin;
    writeDB(db);
    res.json({ success: true });
});

// Reading Plan Management
app.get('/api/plan', (req, res) => {
    const db = readDB();
    const defaultPlan = {
        startDate: "2026-02-01",
        endDate: "2026-10-24",
        totalChapters: 1189,
        dailyTarget: 4
    };
    res.json(db.plan || defaultPlan);
});

app.post('/api/plan', (req, res) => {
    const { startDate, endDate, dailyTarget, requester } = req.body;
    const db = readDB();

    // Only allow admin or 김완주 to update the plan
    const isAdmin = requester && (requester.toLowerCase() === 'admin' || requester === '김완주' || (db.users[requester] && db.users[requester].isAdmin));

    if (!isAdmin) {
        return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }

    db.plan = {
        startDate,
        endDate,
        dailyTarget,
        totalChapters: 1189
    };

    writeDB(db);
    res.json({ success: true, plan: db.plan });
});

// Reset all progress (Admin Only)
app.post('/api/admin/reset-progress', (req, res) => {
    const { adminUser } = req.body;
    const db = readDB();

    if (adminUser !== 'admin' && adminUser !== '김완주' && (!db.users[adminUser] || !db.users[adminUser].isAdmin)) {
        return res.status(403).json({ success: false, message: '권한이 없습니다.' });
    }

    Object.keys(db.users).forEach(username => {
        db.users[username].progress = 0;
        db.users[username].completedCount = 0;
        db.users[username].dailyProgress = {};
        db.users[username].lastRead = '';
    });

    writeDB(db);
    res.json({ success: true, message: '모든 사용자의 진도가 초기화되었습니다.' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
