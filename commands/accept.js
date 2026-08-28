async function acceptCommand(sock, from, msg, isAdmin) {
    if (!from.endsWith('@g.us')) {
        return sock.sendMessage(from, { text: '*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘs.*' }, { quoted: msg });
    }

    if (!isAdmin) {
        return sock.sendMessage(from, { text: '*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.*' }, { quoted: msg });
    }

    try {
        // Fetch pending join requests
        const response = await sock.groupRequestParticipantsList(from);
        
        if (!response || response.length === 0) {
            return sock.sendMessage(from, { text: '*✅ ɴᴏ ᴘᴇɴᴅɪɴɢ ᴊᴏɪɴ ʀᴇǫᴜᴇsᴛs ғᴏᴜɴᴅ ɪɴ ᴛʜɪs ɢʀᴏᴜᴘ.*' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: `*⏳ ғᴏᴜɴᴅ ${response.length} ᴘᴇɴᴅɪɴɢ ʀᴇǫᴜᴇsᴛs. sᴛᴀʀᴛɪɴɢ ᴀᴜᴛᴏ-ᴀᴄᴄᴇᴘᴛ...*` }, { quoted: msg });

        let acceptedCount = 0;
        for (const participant of response) {
            try {
                await sock.groupRequestParticipantsUpdate(from, [participant.jid], 'approve');
                acceptedCount++;
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (err) {
                console.error(`*ғᴀɪʟᴇᴅ ᴛᴏ ᴀᴄᴄᴇᴘᴛ ${participant.jid}:*`, err.message);
            }
        }

        await sock.sendMessage(from, { text: `*✅ sᴜᴄᴄᴇssғᴜʟʟʏ ᴀᴄᴄᴇᴘᴛᴇᴅ ${acceptedCount} ᴘᴇɴᴅɪɴɢ ʀᴇǫᴜᴇsᴛs.*` }, { quoted: msg });

    } catch (e) {
        console.error('*ᴀᴄᴄᴇᴘᴛ ᴄᴏᴍᴍᴀɴᴅ ᴇʀʀᴏʀ:*', e);
        await sock.sendMessage(from, { text: '*❌ ᴇʀʀᴏʀ:* ' + e.message }, { quoted: msg });
    }
}

module.exports = acceptCommand;
