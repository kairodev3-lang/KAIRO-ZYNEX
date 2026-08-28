const fetch = require('node-fetch');

async function memeCommand(sock, chatId, message) {
    try {
        const response = await fetch('https://shizoapi.onrender.com/api/memes/cheems?apikey=shizo');
        
        // Check if response is an image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('image')) {
            const imageBuffer = await response.buffer();
            
            const buttons = [
                { buttonId: '.meme', buttonText: { displayText: '🎭 Another Meme' }, type: 1 },
                { buttonId: '.joke', buttonText: { displayText: '😄 Joke' }, type: 1 }
            ];

            await sock.sendMessage(chatId, { 
                image: imageBuffer,
                caption: "> *ʜᴇʀᴇ's ʏᴏᴜʀ ᴄʜᴇᴇᴍs ᴍᴇᴍᴇ! 🐕*",
                buttons: buttons,
                headerType: 1
            },{ quoted: message});
        } else {
            throw new Error('ɪɴᴠᴀʟɪᴅ ʀᴇsᴘᴏɴsᴇ ᴛʏᴘᴇ ғʀᴏᴍ ᴀᴘɪ');
        }
    } catch (error) {
        console.error('ᴇʀʀᴏʀ ɪɴ ᴍᴇᴍᴇ ᴄᴏᴍᴍᴀɴᴅ:', error);
        await sock.sendMessage(chatId, { 
            text: '*❌ ғᴀɪʟᴇᴅ ᴛᴏ ғᴇᴛᴄʜ ᴍᴇᴍᴇ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.*'
        },{ quoted: message });
    }
}

module.exports = memeCommand;
