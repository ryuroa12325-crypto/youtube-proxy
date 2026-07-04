import express from 'express';
import { LiveChat } from 'youtube-chat';

const app = express();

let latestChat = { author: "", message: "", timestamp: 0 };
let currentListener = null;

function startYouTubeListener(videoId) {
    // 이미 감시 중인 방송이 있다면 종료
    if (currentListener) {
        currentListener.stop();
    }
    
    // 유튜브 라이브 방송 코드(liveId)로 감시 시작
    currentListener = new LiveChat({ liveId: videoId });
    
    // 채팅이나 후원이 올라왔을 때
    currentListener.on('chat', (chatItem) => {
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
    
    // 혹시 모를 에러 발생 시 서버가 꺼지는 것 방지
    currentListener.on('error', (err) => {
        console.log('채팅 감지 중 작은 에러 발생 (무시됨):', err.message);
    });

    currentListener.start();
    console.log(`유튜브 라이브 감시 시작됨: ${videoId}`);
}

app.get('/connect', (req, res) => {
    const videoId = req.query.v;
    if (!videoId) return res.status(400).send("Video ID missing");
    
    try {
        startYouTubeListener(videoId);
        res.json({ success: true, message: "Connected" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/get-chat', (req, res) => { res.json(latestChat); });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`서버 구동 중: 포트 ${PORT}`); });
