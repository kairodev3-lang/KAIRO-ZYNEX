async function command(sock, from, msg, isAdmin, q) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if(!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴄʜᴀɴɢᴇ ᴛʜᴇ sᴜʙᴊᴇᴄᴛ*'},{quoted:msg});
    if(!q) return sock.sendMessage(from,{text:'*❌ ᴜsᴀɢᴇ: .sᴇᴛsᴜʙᴊᴇᴄᴛ ɴᴇᴡ ɴᴀᴍᴇ*'},{quoted:msg});
    try { await sock.groupUpdateSubject(from,q); await sock.sendMessage(from,{text:'*✅ ɢʀᴏᴜᴘ ɴᴀᴍᴇ ᴜᴘᴅᴀᴛᴇᴅ*'},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ɢʀᴏᴜᴘ ɴᴀᴍᴇ*'},{quoted:msg}); }
}
module.exports=command;
