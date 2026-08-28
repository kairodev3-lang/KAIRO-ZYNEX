async function command(sock, from, msg, isAdmin, q) {
    if (!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ Groups only.*'},{quoted:msg});
    if (!isAdmin) return sock.sendMessage(from,{text:'*❌ ᴏɴʟʏ ᴀᴅᴍɪɴs ᴄᴀɴ ᴀᴅᴅ ᴍᴇᴍʙᴇʀs*'},{quoted:msg});
    const nums=(q.match(/\d{8,15}/g)||[]);
    const targets=nums.map(n=>n+'@s.whatsapp.net');
    if(!targets.length) return sock.sendMessage(from,{text:'*❌ ᴜsᴀɢᴇ: .ᴀᴅᴅ 509 xxx xxx*'},{quoted:msg});
    try { await sock.groupParticipantsUpdate(from,targets,'add'); await sock.sendMessage(from,{text:'*✅ ᴀᴅᴅ ʀᴇǫᴜᴇsᴛ ᴄᴏᴍᴘʟᴇᴛᴇᴅ.*'},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴀᴅᴅ ᴍᴇᴍʙᴇʀ(s)*'},{quoted:msg}); }
}
module.exports=command;
