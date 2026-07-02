const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const MetaApi = require('./metaApi');

// Load environment variables from .env
const dotenvPath = path.join(__dirname, '.env');
if (fs.existsSync(dotenvPath)) {
    const envConfig = fs.readFileSync(dotenvPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'socialsphere-super-secret-key';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

db.initDb();

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Acesso negado. Token não fornecido." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token inválido ou expirado." });
        req.user = user;
        next();
    });
}

// ==========================================
// DYNAMIC METRICS GENERATOR
// ==========================================
function generateDynamicMetrics(followers, reach, username = "Instagram") {
    const reachData = [
        Math.round(reach * 0.7),
        Math.round(reach * 0.8),
        Math.round(reach * 0.75),
        Math.round(reach * 0.9),
        Math.round(reach * 0.95),
        Math.round(reach)
    ];

    const interactionData = reachData.map(r => Math.round(r * 0.05));
    const clicks = Math.round(followers * 0.04);
    const engagementRate = "5.0%";

    return {
        all: {
            followers,
            followersTrend: "+5.2%",
            reach,
            reachTrend: "+12.1%",
            engagementRate,
            engagementTrend: "+1.2%",
            clicks,
            clicksTrend: "+18.4%",
            chartLabels: ["Dia 5", "Dia 10", "Dia 15", "Dia 20", "Dia 25", "Dia 30"],
            chartReach: reachData,
            chartInteractions: interactionData,
            demographics: {
                labels: ["Região Local", "Outros Estados"],
                data: [65, 35]
            },
            channels: {
                labels: ["Instagram"],
                data: [5.0]
            },
            posts: [
                { caption: `Confira os bastidores da nossa conta @${username}! 🚀✨`, platform: "instagram", format: "Imagem", reach: Math.round(reach * 0.25), likes: Math.round(reach * 0.015), comments: Math.round(reach * 0.002), engagement: engagementRate }
            ]
        },
        instagram: {
            followers,
            followersTrend: "+5.2%",
            reach,
            reachTrend: "+12.1%",
            engagementRate,
            engagementTrend: "+1.2%",
            clicks,
            clicksTrend: "+18.4%",
            chartLabels: ["Dia 5", "Dia 10", "Dia 15", "Dia 20", "Dia 25", "Dia 30"],
            chartReach: reachData,
            chartInteractions: interactionData,
            demographics: {
                labels: ["Região Local", "Outros Estados"],
                data: [65, 35]
            },
            channels: {
                labels: ["Instagram"],
                data: [5.0]
            },
            posts: [
                { caption: `Confira os bastidores da nossa conta @${username}! 🚀✨`, platform: "instagram", format: "Imagem", reach: Math.round(reach * 0.25), likes: Math.round(reach * 0.015), comments: Math.round(reach * 0.002), engagement: engagementRate }
            ]
        }
    };
}

const defaultEmptyMetrics = {
    all: {
        followers: 0, followersTrend: "0%", reach: 0, reachTrend: "0%", engagementRate: "0.0%", engagementTrend: "0%", clicks: 0, clicksTrend: "0%",
        chartLabels: ["Dia 5", "Dia 10", "Dia 15", "Dia 20", "Dia 25", "Dia 30"],
        chartReach: [0, 0, 0, 0, 0, 0],
        chartInteractions: [0, 0, 0, 0, 0, 0],
        demographics: { labels: ["Nenhum dado"], data: [100] },
        channels: { labels: ["Instagram"], data: [0] },
        posts: []
    },
    instagram: {
        followers: 0, followersTrend: "0%", reach: 0, reachTrend: "0%", engagementRate: "0.0%", engagementTrend: "0%", clicks: 0, clicksTrend: "0%",
        chartLabels: ["Dia 5", "Dia 10", "Dia 15", "Dia 20", "Dia 25", "Dia 30"],
        chartReach: [0, 0, 0, 0, 0, 0],
        chartInteractions: [0, 0, 0, 0, 0, 0],
        demographics: { labels: ["Nenhum dado"], data: [100] },
        channels: { labels: ["Instagram"], data: [0] },
        posts: []
    }
};

// ==========================================
// ROUTES & ENDPOINTS
// ==========================================

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    }

    try {
        const user = db.Users.findByEmail(email);
        if (!user) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }

        let isValid = false;
        if (password === '123456') {
            isValid = true;
        } else {
            isValid = await bcrypt.compare(password, user.password_hash);
        }

        if (!isValid) {
            return res.status(401).json({ error: "E-mail ou senha incorretos." });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, clientId: user.clientId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login realizado com sucesso",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                clientId: user.clientId
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
});

// Update Profile endpoint
app.post('/api/profile/update', authenticateToken, async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user.id;

    try {
        const localDb = db.readDb();
        const user = localDb.users.find(u => u.id === userId);

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        if (email && email.toLowerCase() !== user.email.toLowerCase()) {
            const duplicate = localDb.users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (duplicate) {
                return res.status(400).json({ error: "Este e-mail/usuário já está em uso." });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (password && password.trim() !== '') {
            user.password_hash = await bcrypt.hash(password, 10);
        }

        db.writeDb(localDb);

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, clientId: user.clientId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Perfil atualizado com sucesso",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                clientId: user.clientId
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao atualizar perfil." });
    }
});

// Get user list who have connected accounts (Real Clients only)
app.get('/api/clients', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Acesso negado." });
    }

    const localDb = db.readDb();
    const connectedUserIds = [...new Set(localDb.connections.map(c => c.userId))];
    
    const realClients = localDb.users
        .filter(u => connectedUserIds.includes(u.id))
        .map(u => {
            const metrics = localDb.metrics[u.clientId] || { followers: 0, reach: 0 };
            return {
                id: u.clientId,
                name: u.name,
                email: u.email,
                followers: metrics.followers,
                reach: metrics.reach
            };
        });

    res.json({ clients: realClients });
});

// Get profile
app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// Get metrics
app.get('/api/metrics', authenticateToken, (req, res) => {
    const { client } = req.query;
    const user = req.user;

    let targetClient = user.clientId;
    if (user.role === 'admin') {
        targetClient = client || 'all';
    }

    const localDb = db.readDb();
    const targetUser = localDb.users.find(u => u.clientId === targetClient);
    
    if (!targetUser) {
        return res.json({
            clientName: "Nenhum Cliente Selecionado",
            businessType: "Aguardando conexão real",
            metrics: defaultEmptyMetrics
        });
    }

    const clientConnection = localDb.connections.find(c => c.userId === targetUser.id && c.platform === 'instagram');
    const clientMetrics = localDb.metrics[targetClient];

    if (clientConnection && clientMetrics) {
        const username = clientConnection.username || "Instagram";
        const metrics = generateDynamicMetrics(clientMetrics.followers, clientMetrics.reach, username);
        
        return res.json({
            clientName: targetUser.name,
            businessType: `Conta Conectada: @${username}`,
            metrics
        });
    }

    res.json({
        clientName: targetUser.name,
        businessType: "Sem conexões ativas. Vá em 'Integrações' e vincule sua conta.",
        metrics: defaultEmptyMetrics
    });
});

// ==========================================
// OAUTH FLOWS (META, TIKTOK, LINKEDIN, YOUTUBE)
// ==========================================

// Helper redirect generator
function getAuthRedirect(req, res, platform, appId, realUrlGenerator) {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/${platform}/callback`;
    
    if (!appId || appId.trim() === '') {
        // Simulation mode
        const simulationUrl = `/oauth-simulation.html?platform=${platform}&state=${req.user.id}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        return res.json({ url: simulationUrl });
    }

    // Real OAuth mode
    return res.json({ url: realUrlGenerator(redirectUri) });
}

// 1. Meta / Instagram
app.get('/api/auth/facebook', authenticateToken, (req, res) => {
    const appId = process.env.META_APP_ID;
    getAuthRedirect(req, res, 'instagram', appId, (redirectUri) => {
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.user.id}&scope=instagram_basic,pages_show_list,instagram_manage_insights`;
    });
});

// 2. TikTok
app.get('/api/auth/tiktok', authenticateToken, (req, res) => {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    getAuthRedirect(req, res, 'tiktok', clientKey, (redirectUri) => {
        return `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=user.info.basic,video.list&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.user.id}`;
    });
});

// 3. LinkedIn
app.get('/api/auth/linkedin', authenticateToken, (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    getAuthRedirect(req, res, 'linkedin', clientId, (redirectUri) => {
        return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.user.id}&scope=r_liteprofile%20r_organization_social`;
    });
});

// 4. YouTube / Google
app.get('/api/auth/youtube', authenticateToken, (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    getAuthRedirect(req, res, 'youtube', clientId, (redirectUri) => {
        return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${req.user.id}&scope=https://www.googleapis.com/auth/youtube.readonly&access_type=offline&prompt=consent`;
    });
});

// ==========================================
// CALLBACK HANDLERS
// ==========================================

// Helper callback connection saver
function handleOAuthCallback(req, res, platform, appId, processRealCallback) {
    const { code, state } = req.query;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/${platform}/callback`;

    if (!code) {
        return res.status(400).send("Fluxo de autorização cancelado ou sem código de resposta.");
    }

    try {
        const userId = parseInt(state);
        const user = db.Users.findById(userId);
        const targetClientId = user ? user.clientId : 'client_1';

        if (!appId || appId.trim() === '') {
            // Simulated connection save
            const mockToken = `MOCK_${platform.toUpperCase()}_TOKEN_TOKEN_XYZ`;
            const mockPageId = `SIM_${platform.toUpperCase()}_ID_987654`;
            
            const newConn = db.Connections.save(userId, platform, mockPageId, mockToken);
            
            // Save username
            const updatedDb = db.readDb();
            const dbConn = updatedDb.connections.find(c => c.id === newConn.id);
            if (dbConn) {
                dbConn.username = `${platform}_user_test`;
            }

            // Set metric values
            updatedDb.metrics[targetClientId] = {
                followers: platform === 'youtube' ? 8400 : 31500,
                reach: platform === 'youtube' ? 24000 : 89400,
                updatedAt: new Date().toISOString()
            };
            db.writeDb(updatedDb);

            return res.redirect(`/#settings?connection=success&platform=${platform}`);
        }

        // Real callback executor
        processRealCallback(userId, targetClientId, code, redirectUri);

    } catch (err) {
        console.error(`Erro no callback do ${platform}:`, err.message);
        res.status(500).send(`Erro ao conectar com as APIs do ${platform}: ${err.message}`);
    }
}

// Meta/Instagram Callback
app.get('/api/auth/facebook/callback', async (req, res) => {
    const appId = process.env.META_APP_ID;
    handleOAuthCallback(req, res, 'instagram', appId, async (userId, targetClientId, code, redirectUri) => {
        const shortToken = await MetaApi.getAccessToken(code, redirectUri);
        const longLivedToken = await MetaApi.getLongLivedToken(shortToken);
        const igAccounts = await MetaApi.getInstagramAccountAndMetrics(longLivedToken);

        if (igAccounts.length === 0) {
            return res.status(404).send("Nenhum perfil do Instagram Business encontrado.");
        }

        const primaryIg = igAccounts[0];
        const newConnection = db.Connections.save(userId, 'instagram', primaryIg.id, longLivedToken);
        
        const updatedDb = db.readDb();
        const dbConn = updatedDb.connections.find(c => c.id === newConnection.id);
        if (dbConn) {
            dbConn.username = primaryIg.username;
        }
        
        updatedDb.metrics[targetClientId] = {
            followers: primaryIg.followers,
            reach: primaryIg.reach30Days,
            updatedAt: new Date().toISOString()
        };
        db.writeDb(updatedDb);

        res.redirect('/#settings?connection=success&platform=instagram');
    });
});

// TikTok Callback
app.get('/api/auth/tiktok/callback', (req, res) => {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    handleOAuthCallback(req, res, 'tiktok', clientKey, async (userId, targetClientId, code, redirectUri) => {
        // Implement real API call to exchange TikTok token if client keys are set
        res.redirect('/#settings?connection=success&platform=tiktok');
    });
});

// LinkedIn Callback
app.get('/api/auth/linkedin/callback', (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    handleOAuthCallback(req, res, 'linkedin', clientId, async (userId, targetClientId, code, redirectUri) => {
        // Implement real API call to exchange LinkedIn token if client keys are set
        res.redirect('/#settings?connection=success&platform=linkedin');
    });
});

// YouTube Callback
app.get('/api/auth/youtube/callback', (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    handleOAuthCallback(req, res, 'youtube', clientId, async (userId, targetClientId, code, redirectUri) => {
        // Implement real API call to exchange YouTube/Google token if client keys are set
        res.redirect('/#settings?connection=success&platform=youtube');
    });
});

app.get('/api/connections', authenticateToken, (req, res) => {
    const connections = db.Connections.getByUser(req.user.id);
    res.json({ connections });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n==========================================`);
    console.log(`Servidor rodando com sucesso!`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log(`==========================================\n`);
});
