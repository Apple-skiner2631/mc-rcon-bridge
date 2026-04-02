const express = require('express');
const rconClient = require('rcon-client');
const app = express();
const port = process.env.PORT || 3000;

app.get('/exec', async (req, res) => {
    const user = req.query.user;
    const key = req.query.key;
    
    if (key !== "your_secret_key_123") {
        return res.status(403).send("Forbidden");
    }
    
    if (!user || user === "keepalive") {
        return res.send("Bridge is alive!");
    }

    try {
        // 修正連線語法：嘗試使用靜態方法或實例化
        const rcon = await rconClient.Rcon.connect({
            host: "skyblock-pt.playwithbao.com",
            port: 44750,
            password: "player9950129005090"
        });

        await rcon.send("whitelist add " + user);
        await rcon.send("team join 02_player " + user);
        await rcon.end();

        res.send("Success");
    } catch (err) {
        res.status(500).send("RCON Error: " + err.message);
    }
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});
