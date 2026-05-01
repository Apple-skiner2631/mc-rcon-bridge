const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const express = require('express');
const mineflayer = require('mineflayer');


const app = express();
app.get('/', (req, res) => res.send('Keep-Alive: Bot is running!'));
app.listen(10000, '0.0.0.0');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});


async function runCommandInGame(cmd1, cmd2) {
    const bot = mineflayer.createBot({
        host: 'plays-survival.playwithbao.com', 
        port: 44750,       
        username: 'Verify_Check', 
        version: false,
    });

    bot.once('spawn', () => {
        console.log('Mineflayer 機器人已進入伺服器執行指令...');
        bot.chat(cmd1); 
        setTimeout(() => {
            bot.chat(cmd2); 
            bot.quit();
        }, 1500);
    });

    bot.on('error', err => console.log('Mineflayer 錯誤:', err));
}

client.once('ready', () => console.log('Discord Bot is ready!'));

// --- !setup 指令 ---
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content === '!setup') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('**❌ 只有管理員可以使用此指令。**').then(msg => {
                setTimeout(() => msg.delete(), 5000);
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bind_account')
                .setLabel('🔗 立即綁定帳號')
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle('🤨 Players\'Tavern | 帳號驗證系統')
            .setDescription('**歡迎來到 Players\'Tavern！為了確保遊戲品質與社群安全，進入伺服器前請先完成 Discord 帳號綁定。**')
            .addFields(
                { name: '📜 冒險者規範', value: '**[規則與指令](http://plays-survival.playwithbao.com:31031/#world:0:0:0:1500:0:0:0:0:perspective)**\n**進入前請務必詳閱，以免觸犯遊戲規則。**', inline: false },
                { name: '🛠️ 驗證流程', value: '1️⃣ 點擊下方 **「🔗 立即綁定帳號」** 按鈕\n2️⃣ 準確輸入您的 **遊戲 ID**\n3️⃣ 選擇您使用的 **遊戲版本** (Java/Bedrock)\n4️⃣ 點擊送出，系統將自動處理', inline: false },
                { name: '👥 營運團隊', value: '管理員 Apple_skiner', inline: true }
            )
            .setFooter({ text: 'Players\'Tavern 官方認證系統', iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
            .setColor(0x2F3136);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
});


client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'bind_account') {
        const modal = new ModalBuilder().setCustomId('verify_modal').setTitle('身分驗證面板');
        
        const idInput = new TextInputBuilder()
            .setCustomId('mc_id')
            .setLabel("遊戲 ID")
            .setPlaceholder("請輸入您的 Minecraft 遊戲名稱")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const versionInput = new TextInputBuilder()
            .setCustomId('mc_ver')
            .setLabel("版本 (請輸入 Java 或 Bedrock)")
            .setPlaceholder("例如: Bedrock")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(idInput), 
            new ActionRowBuilder().addComponents(versionInput)
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'verify_modal') {
        await interaction.deferReply({ ephemeral: true });

        const mcId = interaction.fields.getTextInputValue('mc_id');
        const ver = interaction.fields.getTextInputValue('mc_ver').toLowerCase();
        
        let finalId = mcId;
        if (ver.includes('bedrock') || ver.includes('基岩')) {
            finalId = '.' + mcId;
        }

        const cmd1 = `/whitelist add ${finalId}`;
        const cmd2 = `/team join 02_player ${finalId}`;

        try {

            const cmdChannel = await client.channels.fetch(process.env.CMD_CHANNEL_ID);
            await cmdChannel.send(`【驗證申請】ID: ${finalId} | 版本: ${ver}`);

            await runCommandInGame(cmd1, cmd2);

            await interaction.editReply({ 
                content: `**✅ 申請成功！**\n帳號 **${finalId}** 正由系統自動加入白名單並分隊。\n請於 10 秒後嘗試進入伺服器！` 
            });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ 
                content: `**❌ 系統錯誤**\n無法連接至伺服器或指令發送失敗。請聯繫管理員 Apple_skiner。` 
            });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
