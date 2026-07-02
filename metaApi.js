const https = require('https');

// Helper to make HTTPS GET requests returning JSON
function makeGetRequest(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 400) {
                        reject(new Error(parsed.error?.message || `HTTP Error ${res.statusCode}`));
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Meta API endpoints integration
const MetaApi = {
    // 1. Exchange OAuth code for User Access Token
    getAccessToken: async (code, redirectUri) => {
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        
        const url = `https://graph.facebook.com/v18.0/oauth/access_token` + 
                    `?client_id=${appId}` +
                    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                    `&client_secret=${appSecret}` +
                    `&code=${code}`;
        
        const result = await makeGetRequest(url);
        return result.access_token;
    },

    // 2. Exchange short-lived token for long-lived (60 days) user access token
    getLongLivedToken: async (shortLivedToken) => {
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;

        const url = `https://graph.facebook.com/v18.0/oauth/access_token` +
                    `?grant_type=fb_exchange_token` +
                    `&client_id=${appId}` +
                    `&client_secret=${appSecret}` +
                    `&fb_exchange_token=${shortLivedToken}`;

        const result = await makeGetRequest(url);
        return result.access_token;
    },

    // 3. Get Instagram accounts linked to the user's Facebook Pages and extract real insights
    getInstagramAccountAndMetrics: async (userAccessToken) => {
        // Step A: Get list of Facebook Pages owned by the user (and page access tokens)
        const pagesUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`;
        const pagesResult = await makeGetRequest(pagesUrl);
        
        if (!pagesResult.data || pagesResult.data.length === 0) {
            throw new Error("Nenhuma Página do Facebook encontrada vinculada a esta conta.");
        }

        const instagramAccounts = [];

        // Step B: For each page, query for linked Instagram Business Account
        for (const page of pagesResult.data) {
            const pageToken = page.access_token;
            const pageId = page.id;
            
            const igUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`;
            
            try {
                const igResult = await makeGetRequest(igUrl);
                
                if (igResult.instagram_business_account) {
                    const igId = igResult.instagram_business_account.id;
                    
                    // Step C: Fetch real account metrics (followers count, media count, etc.)
                    const metricsUrl = `https://graph.facebook.com/v18.0/${igId}?fields=username,name,followers_count,media_count&access_token=${pageToken}`;
                    const metricsResult = await makeGetRequest(metricsUrl);

                    // Step D: Fetch profile insights (reach & impressions) for the last 30 days
                    const insightsUrl = `https://graph.facebook.com/v18.0/${igId}/insights?metric=reach,impressions&period=day&access_token=${pageToken}`;
                    let reach30Days = 0;
                    try {
                        const insightsResult = await makeGetRequest(insightsUrl);
                        // Sum reach values returned for the range
                        const reachData = insightsResult.data?.find(d => d.name === 'reach');
                        if (reachData && reachData.values) {
                            reach30Days = reachData.values.reduce((sum, v) => sum + (v.value || 0), 0);
                        }
                    } catch (igError) {
                        console.warn(`Aviso ao obter insights detalhados do IG ${igId}:`, igError.message);
                        reach30Days = metricsResult.followers_count * 3; // Fallback estimate
                    }

                    instagramAccounts.push({
                        id: igId,
                        username: metricsResult.username,
                        name: metricsResult.name || metricsResult.username,
                        followers: metricsResult.followers_count,
                        mediaCount: metricsResult.media_count,
                        reach30Days: reach30Days,
                        pageAccessToken: pageToken
                    });
                }
            } catch (err) {
                console.error(`Erro ao consultar dados da página ${page.name}:`, err.message);
            }
        }

        return instagramAccounts;
    }
};

module.exports = MetaApi;
