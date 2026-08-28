async function command(sock, from, msg, isAdmin) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘ ᴏɴʟʏ*'},{quoted:msg});
    if(!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ɢᴇᴛ ᴛʜᴇ ɢʀᴏᴜᴘ ʟɪɴᴋ*'},{quoted:msg});
    try { const code=await sock.groupInviteCode(from); await sock.sendMessage(from,{text:`*🔗 ɢʀᴏᴜᴘ ʟɪɴᴋ*\nhttps://chat.whatsapp.com/${code}`},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴍᴀᴋᴇ sᴜʀᴇ ᴛʜᴇ ʙᴏᴛ ɪs ᴀɴ ᴀᴅᴍɪɴ*'},{quoted:msg}); }
}
module.exports=command;
