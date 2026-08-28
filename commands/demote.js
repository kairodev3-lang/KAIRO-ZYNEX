async function command(sock, from, msg, isAdmin) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪᴀ ғᴏʀ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if (!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ɢʀᴏᴜᴘs ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs*'},{quoted:msg});
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(from,{text:'*❌ ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴀᴅᴍɪɴ ʏᴏᴜ ᴡᴀɴᴛ ᴅᴇᴍᴏᴛᴇ*'},{quoted:msg});
    try { await sock.groupParticipantsUpdate(from,[target],'demote'); await sock.sendMessage(from,{text:`*✅ @${target.split('@')[0]} is no longer an admin.*`,mentions:[target]},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪs ᴀɴ ᴀᴅᴍɪɴ*'},{quoted:msg}); }
}
module.exports=command;
