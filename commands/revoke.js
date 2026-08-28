async function command(sock, from, msg, isAdmin) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    if(!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ʀᴇᴠᴏᴋᴇ ᴛʜᴇ ʟɪɴᴋ*'},{quoted:msg});
    try { await sock.groupRevokeInvite(from); await sock.sendMessage(from,{text:'*✅ ɢʀᴏᴜᴘ ɪɴᴠɪᴛᴇ ʟɪɴᴋ ʀᴇᴠᴏᴋᴇᴅ*'},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴛᴏ ʀᴇᴠᴏᴋᴇ ᴛʜᴇ ʟɪɴᴋ*'},{quoted:msg}); }
}
module.exports=command;
