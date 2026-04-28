
const axios = require('axios');

async function sendToWebhook(mcId, isBedrock) {
    const finalId = isBedrock ? `.${mcId}` : mcId;
    const webhookUrl = 'https://discord.com/api/webhooks/1497711106779648281/8UfMJSZ0PB_Jfj9du31Gqsj5iNbjmekdHvdyLg2jsHTqcVXViyQKakVDupdZLLRGDTH4';
    
    await axios.post(webhookUrl, {
        content: `!run whitelist add ${finalId}`
    });
}
