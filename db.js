const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

// Initial schema database structure
const initialData = {
    users: [
        {
            id: 1,
            name: "NutriLife Admin",
            email: "nutrilife@cliente.com",
            password_hash: "$2b$10$Y5n2Cg1jWpSwWsk5Xn1fGu0cWJ2G8zM8z8H8z8H8z8H8z8H8z8H8S", // hash for "123456"
            role: "client",
            clientId: "client_1"
        },
        {
            id: 2,
            name: "TechCore Admin",
            email: "techcore@cliente.com",
            password_hash: "$2b$10$Y5n2Cg1jWpSwWsk5Xn1fGu0cWJ2G8zM8z8H8z8H8z8H8z8H8z8H8S", // hash for "123456"
            role: "client",
            clientId: "client_2"
        },
        {
            id: 3,
            name: "BellaModa Admin",
            email: "bellamoda@cliente.com",
            password_hash: "$2b$10$Y5n2Cg1jWpSwWsk5Xn1fGu0cWJ2G8zM8z8H8z8H8z8H8z8H8z8H8S", // hash for "123456"
            role: "client",
            clientId: "client_3"
        },
        {
            id: 4,
            name: "Iverson Silva (Gestor)",
            email: "admin@gestor.com",
            password_hash: "$2b$10$Y5n2Cg1jWpSwWsk5Xn1fGu0cWJ2G8zM8z8H8z8H8z8H8z8H8z8H8S", // hash for "123456"
            role: "admin",
            clientId: "all"
        }
    ],
    connections: [],
    metrics: {}
};

// Ensure database file exists
function initDb() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
        console.log("Banco de dados JSON inicializado com sucesso.");
    }
}

// Read whole database
function readDb() {
    initDb();
    try {
        const content = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        console.error("Erro ao ler banco de dados:", err);
        return initialData;
    }
}

// Write to database
function writeDb(data) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error("Erro ao gravar banco de dados:", err);
        return false;
    }
}

// User CRUD & Auth helpers
const Users = {
    findByEmail: (email) => {
        const db = readDb();
        return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },
    findById: (id) => {
        const db = readDb();
        return db.users.find(u => u.id === id);
    },
    create: (user) => {
        const db = readDb();
        const nextId = db.users.reduce((max, u) => u.id > max ? u.id : max, 0) + 1;
        const newUser = { id: nextId, ...user };
        db.users.push(newUser);
        writeDb(db);
        return newUser;
    }
};

// Connections (Tokens Meta API)
const Connections = {
    save: (userId, platform, pageId, accessToken) => {
        const db = readDb();
        // Remove duplicate connection if exists
        db.connections = db.connections.filter(c => !(c.userId === userId && c.platform === platform));
        
        const newConnection = {
            id: db.connections.length + 1,
            userId,
            platform,
            pageId,
            accessToken,
            connectedAt: new Date().toISOString()
        };
        db.connections.push(newConnection);
        writeDb(db);
        return newConnection;
    },
    getByUser: (userId) => {
        const db = readDb();
        return db.connections.filter(c => c.userId === userId);
    }
};

module.exports = {
    initDb,
    Users,
    Connections,
    readDb,
    writeDb
};
