module.exports = {
  apps : [{
    name: "𝗗𝗥𝗨𝗭𝗭 𝗫-𝗠𝗗",
    script: "./server.js",
    watch: false,
    autorestart: true,
    max_memory_restart: '2G',
    env: {
      NODE_ENV: "production",
    }
  }]
};
