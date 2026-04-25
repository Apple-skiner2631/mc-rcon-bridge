const express = require('express');
const { Rcon } = require('rcon-client');
const app = express();
const port = process.env.PORT || 3000;

app.get('/exec', async (req, res) => {
    const user = req.query.user;
    const key = req.query.key;
    
    if (key !== "your_secret_key_123") {
        return res.status(403).send("Forbidden");
    }
    
    if (!user || user === "keepalive") {
        return res.send("ok!");
    }

    const rcon = new Rcon({
        host: "plays-survival.playwithbao.com",
        port: 44750,
        password: "player9950129005090",
        timeout: 5000
    });

    try {
        await rcon.connect();
        
        // 分開執行並等待結果
        const resp1 = await rcon.send("whitelist add " + user);
        console.log("Whitelist response: " + resp1);
        
        const resp2 = await rcon.send("team join 02_player " + user);
        console.log("Team response: " + resp2);

        // 稍微停頓 0.5 秒確保指令發送完畢
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await rcon.end();
        res.send("Success: Commands sent for " + user);
    } catch (err) {
        res.status(500).send("RCON Error: " + err.message);
    }
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});
