async function command(sock, from, msg) {
    if(!from.endsWith('@g.us')) return sock.sendMessage(from,{text:'*❌ ɢʀᴏᴜᴘs ᴏɴʟʏ*'},{quoted:msg});
    try { const m=await sock.groupMetadata(from); const a=m.participants.filter(p=>p.admin); const t='*👑 ɢʀᴏᴜᴘs ᴀᴅᴍɪɴs*\n'+a.map((p,i)=>`${i+1}. @${p.id.split('@')[0]}`).join('\n'); await sock.sendMessage(from,{text:t,mentions:a.map(p=>p.id)},{quoted:msg}); }
    catch(e){ await sock.sendMessage(from,{text:'*❌ ᴄᴏᴜʟᴅ ɴᴏᴛ ғᴇᴄᴛʜ ᴀᴅᴍɪɴs*'},{quoted:msg}); }
}
module.exports=command;
