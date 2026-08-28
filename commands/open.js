async function command(sock, from, msg, isAdmin) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘ ᴏɴʟʏ*'},{quoted:msg});
    if(!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴏᴘᴇɴ ᴛʜᴇ ɢʀᴏᴜᴘ*'},{quoted:msg});
    try { await sock.groupSettingUpdate(from,'not_announcement'); await sock.sendMessage(from,{text:'*✅ ɢʀᴏᴜᴘ ᴏᴘᴇɴᴇᴅ. ᴇᴠᴇʀʏᴏɴᴇ ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs*'},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴏᴘᴇɴ ɢʀᴏᴜᴘ*'},{quoted:msg}); }
}
module.exports=command;
