const express = require('express');
const { LiveChat } = require('youtube-chat'); // 안정적인 라이브러리로 변경
const app = express();

let latestChat = { author: "", message: "", timestamp: 0 };
let currentListener = null;

function startYouTubeListener(videoId) {
    if (currentListener) {
        currentListener.stop();
    }
    
    // 원조 라이브러리 주입
    currentListener = new LiveChat({ videoId: videoId });
    
    currentListener.on('chat', (chatItem) => {
        // 메시지 텍스트 추출 추출
        let messageText = "";
        if (chatItem.message) {
            messageText = chatItem.message.map(m => m.text || "").join("");
        }
        
        latestChat = {
            author: chatItem.author.name,
            message: messageText, 
            timestamp: Date.now()
        };
    });
    
    currentListener.start();
    console.log(`유튜브 라이브 감시 시작: ${videoId}`);
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
