const toBold = (text) => {
    const boldChars = {
        'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
        '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
    };
    return text.split('').map(c => boldChars[c] || c).join('');
};

async function statusCommand(sock, from, msg, isAdmin, botData, saveBotData, userId, args) {
    if (!isAdmin) return await sock.sendMessage(from, { text: "*❌ ᴏɴʟʏ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*" }, { quoted: msg });
    
    if (!botData.statusSettings[userId]) {
        botData.statusSettings[userId] = {
            autoStatus: false,
            autoSeen: false,
            autoLike: false,
            autoDownload: false,
            system: 1,
            isPublic: false
        };
    }
    
    const action = args[0]?.toLowerCase();
    
    if (!action) {
        const settings = botData.statusSettings[userId];
        const menu = `╭━━━〔 ${toBold("sᴛᴀᴛᴜs sᴇᴛᴛɪɴɢs")} 〕━━━┈⊷\n` +
                   `┃ ★ ${toBold("ᴀᴜᴛᴏ sᴛᴀᴛᴜs:")} ${settings.autoStatus ? '✅' : '❌'}\n` +
                   `┃ ★ ${toBold("ᴀᴜᴛᴏ sᴇᴇɴ:")} ${settings.autoSeen ? '✅' : '❌'}\n` +
                   `┃ ★ ${toBold("ᴀᴜᴛᴏ ʟɪᴋᴇ:")} ${settings.autoLike ? '✅' : '❌'}\n` +
                   `┃ ★ ${toBold("ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ:")} ${settings.autoDownload ? '✅' : '❌'}\n` +
                   `┃ ★ ${toBold("ᴄᴜʀʀᴇɴᴛ sʏsᴛᴇᴍ:")} ${settings.system || 1}\n` +
                   `╰━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
                   `*ᴄᴏᴍᴍᴀɴᴅs:*\n` +
                   `.sᴛᴀᴛᴜs ᴏɴ/ᴏғғ - ᴛᴏɢɢʟᴇ ᴀʟʟ\n` +
                   `.sᴛᴀᴛᴜs sᴇᴇɴ ᴏɴ/ᴏғғ\n` +
                   `.sᴛᴀᴛᴜs ʟɪᴋᴇ ᴏɴ/ᴏғғ\n` +
                   `.sᴛᴀᴛᴜs ᴅᴏᴡɴʟᴏᴀᴅ ᴏɴ/ᴏғғ\n` +
                   `.sᴛᴀᴛᴜs sʏsᴛᴇᴍ 1/2/3`;
        return await sock.sendMessage(from, { text: menu }, { quoted: msg });
    }

    if (action === 'on') {
        botData.statusSettings[userId].autoStatus = true;
        botData.statusSettings[userId].autoSeen = true;
        botData.statusSettings[userId].autoLike = true;
        botData.statusSettings[userId].autoDownload = true;
        saveBotData();
        await sock.sendMessage(from, { text: "✅ *ᴀʟʟ sᴛᴀᴛᴜs ғᴇᴀᴛᴜʀᴇs: ᴏɴ*" }, { quoted: msg });
    } else if (action === 'off') {
        botData.statusSettings[userId].autoStatus = false;
        botData.statusSettings[userId].autoSeen = false;
        botData.statusSettings[userId].autoLike = false;
        botData.statusSettings[userId].autoDownload = false;
        saveBotData();
        await sock.sendMessage(from, { text: "❌ *ᴀʟʟ sᴛᴀᴛᴜs ғᴇᴀᴛᴜʀᴇs: ᴏғғ*" }, { quoted: msg });
    } else if (action === 'seen') {
        const val = args[1]?.toLowerCase();
        if (val === 'on') {
            botData.statusSettings[userId].autoSeen = true;
            botData.statusSettings[userId].autoStatus = true;
            saveBotData();
            await sock.sendMessage(from, { text: "✅ *ᴀᴜᴛᴏ sᴇᴇɴ: ᴏɴ*" }, { quoted: msg });
        } else if (val === 'off') {
            botData.statusSettings[userId].autoSeen = false;
            saveBotData();
            await sock.sendMessage(from, { text: "❌ *ᴀᴜᴛᴏ sᴇᴇɴ: ᴏғғ*" }, { quoted: msg });
        }
    } else if (action === 'like') {
        const val = args[1]?.toLowerCase();
        if (val === 'on') {
            botData.statusSettings[userId].autoLike = true;
            botData.statusSettings[userId].autoStatus = true;
            saveBotData();
            await sock.sendMessage(from, { text: "✅ *ᴀᴜᴛᴏ ʟɪᴋᴇ: ᴏɴ*" }, { quoted: msg });
        } else if (val === 'off') {
            botData.statusSettings[userId].autoLike = false;
            saveBotData();
            await sock.sendMessage(from, { text: "❌ *ᴀᴜᴛᴏ ʟɪᴋᴇ: ᴏғғ*" }, { quoted: msg });
        }
    } else if (action === 'download') {
        const val = args[1]?.toLowerCase();
        if (val === 'on') {
            botData.statusSettings[userId].autoDownload = true;
            botData.statusSettings[userId].autoStatus = true;
            saveBotData();
            await sock.sendMessage(from, { text: "✅ *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ: ᴏɴ*" }, { quoted: msg });
        } else if (val === 'off') {
            botData.statusSettings[userId].autoDownload = false;
            saveBotData();
            await sock.sendMessage(from, { text: "❌ *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ: ᴏғғ*" }, { quoted: msg });
        }
    } else if (action === 'system') {
        const sys = parseInt(args[1]);
        if ([1, 2, 3].includes(sys)) {
            botData.statusSettings[userId].system = sys;
            saveBotData();
            await sock.sendMessage(from, { text: `✅ *ᴏs sʏsᴛᴇᴍ sᴇᴛ ᴛᴏ: ${sys}*` }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: "❌ ᴄʜᴏᴏsᴇ sʏsᴛᴇᴍ 1, 2, ᴏʀ 3." }, { quoted: msg });
        }
    }
}

module.exports = statusCommand;
