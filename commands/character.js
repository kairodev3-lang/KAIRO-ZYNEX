const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: '*ᴘʟᴇᴀsᴇ ᴍᴇɴᴛɪᴏɴ sᴏᴍᴇᴏɴᴇ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴛʜᴇɪʀ ᴍᴇssᴀɢᴇ ᴛᴏ ᴀɴᴀʟʏᴢᴇ ᴛʜᴇɪʀ ᴄʜᴀʀᴀᴄᴛᴇʀ!*', 
            ...channelInfo 
        });
        return;
    }

    try {
        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image if no profile pic
        }

        const traits = [
            "Intelligent", "Creative", "Determined", "Ambitious", "Caring",
            "Charismatic", "Confident", "Empathetic", "Energetic", "Friendly",
            "Generous", "Honest", "Humorous", "Imaginative", "Independent",
            "Intuitive", "Kind", "Logical", "Loyal", "Optimistic",
            "Passionate", "Patient", "Persistent", "Reliable", "Resourceful",
            "Sincere", "Thoughtful", "Understanding", "Versatile", "Wise"
        ];

        // Get 3-5 random traits
        const numTraits = Math.floor(Math.random() * 3) + 3; // Random number between 3 and 5
        const selectedTraits = [];
        for (let i = 0; i < numTraits; i++) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) {
                selectedTraits.push(randomTrait);
            }
        }

        // Calculate random percentages for each trait
        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60; // Random number between 60-100
            return `${trait}: ${percentage}%`;
        });

        // Create character analysis message
        const analysis = `╭══✦〔🔮 *𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿 𝗔𝗻𝗮𝗹𝘆𝘀𝗶𝘀* 🔮〕✦═╮\n│ \n` +
            `│ 👤 *𝗨𝘀𝗲𝗿:* ${userToAnalyze.split('@')[0]}\n│ \n` +
            `│ ✨ *𝗞𝗲𝘆 𝗧𝗿𝗮𝗶𝘁𝘀:*\n│ ${traitPercentages.join('\n')}\n│ \n` +
            `│ 🎯 *𝗢𝘃𝗲𝗿𝗮𝗹𝗹 𝗥𝗮𝘁𝗶𝗻𝗴:* ${Math.floor(Math.random() * 21) + 80}%\n│ \n` +
            `│ 𝗡𝗼𝘁𝗲: 𝗧𝗵𝗶𝘀 𝗶𝘀 𝗮 𝗳𝘂𝗻 𝗮𝗻𝗮𝗹𝘆𝘀𝗶𝘀 𝗮𝗻𝗱 𝘀𝗵𝗼𝘂𝗹𝗱 𝗻𝗼𝘁 𝗯𝗲 𝘁𝗮𝗸𝗲𝗻 𝘀𝗲𝗿𝗶𝗼𝘂𝘀𝗹𝘆!\n│ \n` +
            `╰═✦═✦═✦═✦═✦═✦═✦═✦═✦═╯`;

        // Send the analysis with the user's profile picture
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze],
            ...channelInfo
        });

    } catch (error) {
        console.error('ᴇʀʀᴏʀ ɪɴ ᴄʜᴀʀᴀᴄᴛᴇʀ ᴄᴏᴍᴍᴀɴᴅ:', error);
        await sock.sendMessage(chatId, { 
            text: 'ғᴀɪʟᴇᴅ ᴛᴏ ᴀɴᴀʟʏᴢᴇ ᴄʜᴀʀᴀᴄᴛᴇʀ! ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.',
            ...channelInfo 
        });
    }
}

module.exports = characterCommand; 