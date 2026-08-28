async function command(sock, from, msg, isAdmin) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ғᴏʀ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if (!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ɢʀᴏᴜᴘ ᴀᴅᴍɪɴs ᴄᴀɴ ᴜsᴇ ᴛʜɪs*'},{quoted:msg});
    const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || msg.message?.extendedTextMessage?.contextInfo?.participant;
    if (!target) return sock.sendMessage(from,{text:'*❌ ᴛᴀɢ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇ ᴜsᴇʀ ʏᴏᴜ ᴡᴀɴᴛ ᴛᴏ ᴘʀᴏᴍᴏᴛᴇ*'},{quoted:msg});
    try { await sock.groupParticipantsUpdate(from,[target],'promote'); await sock.sendMessage(from,{text:`*✅ @${target.split('@')[0]} ɪs ɴᴏᴡ ᴀɴ ᴀᴅᴍɪɴ*`,mentions:[target]},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ. ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪs ᴀɴ ᴀᴅᴍɪɴ*'},{quoted:msg}); }
}
module.exports=command;
