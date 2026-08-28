


const axios = require('axios');


/**
 * APK Downloader Command
 * Fetches APK details & downloads the file using NexOracle API.
 */
async function apkCommand(sock, chatId, message) {
  try {
    // Extract the user message
    const userMessage =
      message.message.conversation ||
      message.message.extendedTextMessage?.text ||
      '';
    const appName = userMessage.split(' ').slice(1).join(' ');

    if (!appName) {
      await sock.sendMessage(
        chatId,
        { text: '*⚠️ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀɴ ᴀᴘᴘ ɴᴀᴍᴇ. ᴇxᴀᴍᴘʟᴇ: `.ᴀᴘᴋ ᴡʜᴀᴛsᴀᴘᴘ*`' },
        { quoted: message }
      );
      return;
    }

    // React with hourglass while processing
    await sock.sendMessage(chatId, { react: { text: '⏳', key: message.key } });

    // API call to NexOracle
    const apiUrl = 'https://api.nexoracle.com/downloader/apk';
    const params = {
      apikey: 'free_key@maher_apis', // Replace with your API key if needed
      q: appName,
    };

    const response = await axios.get(apiUrl, { params });

    if (!response.data || response.data.status !== 200 || !response.data.result) {
      await sock.sendMessage(
        chatId,
        { text: '*❌ ᴜɴᴀʙʟᴇ ᴛᴏ ғɪɴᴅ ᴛʜᴇ ᴀᴘᴋ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.*' },
        { quoted: message }
      );
      return;
    }

    const { name, lastup, package, size, icon, dllink } = response.data.result;

    // Send thumbnail preview
    await sock.sendMessage(
      chatId,
      {
        image: { url: icon },
        caption: `*📦 ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ${name}... ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ.*`,
      },
      { quoted: message }
    );

    // Download APK file
    const apkResponse = await axios.get(dllink, { responseType: 'arraybuffer' });
    if (!apkResponse.data) {
      await sock.sendMessage(
        chatId,
        { text: '*❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴛʜᴇ ᴀᴘᴋ. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.*' },
        { quoted: message }
      );
      return;
    }

    const apkBuffer = Buffer.from(apkResponse.data, 'binary');

    // Format message with details
    const details = `📦 *ᴀᴘᴋ ᴅᴇᴛᴀɪʟs* 📦\n\n` +
      `*🔖 ɴᴀᴍᴇ*: ${name}\n` +
      `*📅 ʟᴀsᴛ ᴜᴘᴅᴀᴛᴇ*: ${lastup}\n` +
      `*📦 ᴘᴀᴄᴋᴀɢᴇ*: ${package}\n` +
      `*📏 sɪᴢᴇ*: ${size}\n\n` +
      `> *©ᴍᴀᴋᴇ ʙʏ ᴅʀᴜᴢᴢ x-ᴍᴅ*`;

    // Send APK as document
    await sock.sendMessage(
      chatId,
      {
        document: apkBuffer,
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${name}.apk`,
        caption: details
        
      },
      { quoted: message }
    );

    // Success reaction
    await sock.sendMessage(chatId, { react: { text: '✅', key: message.key } });

  } catch (error) {
    console.error('*❌ ᴇʀʀᴏʀ ɪɴ ᴀᴘᴋᴄᴏᴍᴍᴀɴᴅ:*', error);

    await sock.sendMessage(
      chatId,
      { text: '*❌ ᴜɴᴀʙʟᴇ ᴛᴏ ғᴇᴛᴄʜ ᴀᴘᴋ ᴅᴇᴛᴀɪʟs. ᴘʟᴇᴀsᴇ ᴛʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.*' },
      { quoted: message }
    );

    // Failure reaction
    await sock.sendMessage(chatId, { react: { text: '❌', key: message.key } });
  }
}

module.exports = apkCommand;
