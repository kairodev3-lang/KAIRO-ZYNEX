async function command(sock, from, msg, isAdmin, q) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if(!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴄʜᴀɴɢᴇ ᴛʜᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*'},{quoted:msg});
    if(!q) return sock.sendMessage(from,{text:'*❌ ᴜsᴀɢᴇ: .sᴇᴛᴅᴇsᴄ ʏᴏᴜʀ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*'},{quoted:msg});
    try { await sock.groupUpdateDescription(from,q); await sock.sendMessage(from,{text:'*✅ ɢʀᴏᴜᴘ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ ᴜᴘᴅᴀᴛᴇᴅ*'},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴜᴘᴅᴀᴛᴇ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ*'},{quoted:msg}); }
}
module.exports=command;
