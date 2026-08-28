const answers = ['Yes. ✨','No. ❌','Definitely! 🔥','Probably. 🤔','Ask me again later. ⏳','Absolutely not. 😂','The stars say yes. 🌟'];
const truths = ['What is the funniest thing you have done in a group?','Who was your last chat? 👀','What is one skill you wish you had?','What is your most used emoji?'];
const dares = ['Send your last saved sticker. 😂','Change your WhatsApp status for 5 minutes.','Send “I am a legend” to the group. 😎','Reply with only emojis for your next 3 messages.'];
function calc(expr){
    if (!expr || !/^[0-9+\-*/().%\s]+$/.test(expr)) return null;
    try { const value = Function(`"use strict"; return (${expr})`)(); return Number.isFinite(value) ? value : null; } catch { return null; }
}
async function funCommand(sock, from, msg, command, q) {
    const pick = a => a[Math.floor(Math.random()*a.length)];
    let text;
    switch(command){
        case '8ball': text = `🎱 *8BALL*\n\n${pick(answers)}`; break;
        case 'coinflip': text = `🪙 *COIN FLIP*\n\n${Math.random() < .5 ? 'Heads 🟣' : 'Tails 🔵'}`; break;
        case 'dice': case 'roll': { const n = Math.floor(Math.random()*6)+1; text = `🎲 *DICE ROLL*\n\nYou rolled: *${n}*`; break; }
        case 'ship': { const pct=Math.floor(Math.random()*101); text=`💞 *COMPATIBILITY*\n\n${q ? q : '@two-users'}\n\n❤️ *${pct}%*`; break; }
        case 'rate': { const pct=Math.floor(Math.random()*101); text=`⭐ *RATING*\n\n${q || 'That'} gets *${pct}/100* 😎`; break; }
        case 'pick': { const items=q.split('|').map(x=>x.trim()).filter(Boolean); text=items.length>=2 ? `🎯 *I PICK:*\n\n*${pick(items)}*` : '*❌ ᴜsᴇ: .ᴘɪᴄᴋ ᴘɪᴢᴢᴀ | ʙᴜʀɢᴇʀ | ᴛᴀᴄᴏ*'; break; }
        case 'truth': text=`🧠 *TRUTH*\n\n${pick(truths)}`; break;
        case 'dare': text=`🔥 *DARE*\n\n${pick(dares)}`; break;
        case 'calc': { const v=calc(q); text=v === null ? '*❌ ᴜsᴇ ɴᴜᴍʙᴇʀs ᴀɴᴅ + - * / % ( ).*' : `🧮 *CALCULATOR*\n\n${q} = *${v}*`; break; }
        default: text='❌ Unknown fun command.';
    }
    await sock.sendMessage(from,{text},{quoted:msg});
}
module.exports=funCommand;
