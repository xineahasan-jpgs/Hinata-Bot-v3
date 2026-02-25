const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
  global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "2.0",
    author: "Nazim Stylish Edit",
    category: "events"
  },

  langs: {
    en: {
      session1: "Morning 🌅",
      session2: "Noon ☀️",
      session3: "Afternoon 🌇",
      session4: "Evening 🌙",
      welcomeMessage: "Bot Joined Successfully ✅",
      multiple1: "You",
      multiple2: "You Guys",

defaultWelcomeMessage: `╔═══━━━─── • ───━━━═══╗
        🥀 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 🥀
╚═══━━━─── • ───━━━═══╝

🧸 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫: {userName}
🏡 𝐆𝐫𝐨𝐮𝐩: 『 {boxName} 』

🚀 𝐀𝐝𝐝𝐞𝐝 𝐁𝐲: {addedBy}

🌅 𝐒𝐞𝐬𝐬𝐢𝐨𝐧: {session}

📖 May Allah bless you in this group
🤝 Respect Everyone
📌 Follow All Rules

━━━━━━━━━━━━━━
👑 𝐀𝐝𝐦𝐢𝐧: Mehedi Hasan
━━━━━━━━━━━━━━`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType == "log:subscribe")
      return async function () {

        const hours = getTime("HH");
        const { threadID, author } = event;
        const dataAddedParticipants = event.logMessageData.addedParticipants;

        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID()))
          return message.send(getLang("welcomeMessage"));

        if (!global.temp.welcomeEvent[threadID])
          global.temp.welcomeEvent[threadID] = {
            joinTimeout: null,
            dataAddedParticipants: []
          };

        global.temp.welcomeEvent[threadID].dataAddedParticipants.push(...dataAddedParticipants);
        clearTimeout(global.temp.welcomeEvent[threadID].joinTimeout);

        global.temp.welcomeEvent[threadID].joinTimeout = setTimeout(async function () {

          const threadData = await threadsData.get(threadID);
          if (threadData.settings.sendWelcomeMessage == false)
            return;

          const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;
          const threadName = threadData.threadName;

          let addedByName = "Unknown";
          try {
            const info = await api.getUserInfo(author);
            addedByName = info[author].name;
          } catch {}

          const userName = [];
          const mentions = [];

          for (const user of dataAddedParticipants) {
            userName.push(user.fullName);
            mentions.push({
              tag: user.fullName,
              id: user.userFbId
            });
          }

          if (userName.length == 0) return;

          let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

          welcomeMessage = welcomeMessage
            .replace(/\{userName\}/g, userName.join(", "))
            .replace(/\{boxName\}/g, threadName)
            .replace(/\{addedBy\}/g, addedByName)
            .replace(/\{session\}/g,
              hours <= 10 ? getLang("session1") :
              hours <= 12 ? getLang("session2") :
              hours <= 18 ? getLang("session3") :
              getLang("session4")
            );

          message.send({
            body: welcomeMessage,
            mentions
          });

          delete global.temp.welcomeEvent[threadID];

        }, 1500);
      };
  }
};
