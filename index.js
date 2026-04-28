
const axios = require('axios');

async function sendToWebhook(mcId, isBedrock) {
    const finalId = isBedrock ? `.${mcId}` : mcId;
    const webhookUrl = '你的WEBHOOK_URL';
    
    await axios.post(webhookUrl, {
        content: `!run whitelist add ${finalId}`
    });
}
