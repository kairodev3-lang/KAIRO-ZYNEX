async function command(sock, from, msg, isAdmin) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if(!isAdmin) return sock.sendMessage(from,{text:'*❌ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴄʟᴏsᴇ ᴛʜᴇ ɢʀᴏᴜᴘ caɴ'},{quoted:msg});
    try { await sock.groupSettingUpdate(from,'announcement'); await sock.sendMessage(from,{text:'*🔒 ɢʀᴏᴜᴘ ᴄʟᴏsᴇᴅ. ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ sᴇɴᴅ ᴍᴇssᴀɢᴇs*'},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴄʟᴏsᴇ ɢʀᴏᴜᴘ*'},{quoted:msg}); }
}
module.exports=command;
