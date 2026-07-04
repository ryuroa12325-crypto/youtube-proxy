const express = require('express');
const { ChatListener } = require('@letruxux/youtube-chat');
const app = express();

let latestChat = { author: "", message: "", timestamp: 0 };
let currentListener = null;

function startYouTubeListener(videoId) {
    if (currentListener) { currentListener.stop(); }
    currentListener = new ChatListener(videoId);
    currentListener.onMessage((message) => {
        latestChat = {
            author: message.author,
            message: message.text, 
            timestamp: Date.now()
        };
    });
    currentListener.start();
}

app.get('/connect', (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.status(400).send("Video ID missing");
    try {
        startYouTubeListener(videoId);
        res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/get-chat', (req, res) => { res.json(latestChat); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`서버 구동 중: 포트 ${PORT}`); });
