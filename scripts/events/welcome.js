const { getTime, drive } = global.utils;
if (!global.temp.welcomeEvent)
  global.temp.welcomeEvent = {};

module.exports = {
  config: {
    name: "welcome",
    version: "3.0",
    author: "Nazim Premium Edit",
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

╭───❖ 🧸 𝐍𝐞𝐰 𝐌𝐞𝐦𝐛𝐞𝐫 ❖───╮
   ➤ {userName}
╰────────────────────╯

╭───❖ 🏡 𝐆𝐫𝐨𝐮𝐩 ❖───╮
   ➤ 『 {boxName} 』
╰────────────────╯

╭───❖ 👥 𝐌𝐞𝐦𝐛𝐞𝐫 𝐂𝐨𝐮𝐧𝐭 ❖───╮
   ➤ {memberCount} Members
╰────────────────────────╯

╭───❖ 🆔 𝐔𝐬𝐞𝐫 𝐈𝐃 ❖───╮
   ➤ {uid}
╰────────────────╯

╭───❖ 🚀 𝐀𝐝𝐝𝐞𝐝 𝐁𝐲 ❖───╮
   ➤ {addedBy}
╰────────────────────╯

╭───❖ ⏰ 𝐉𝐨𝐢𝐧 𝐓𝐢𝐦𝐞 ❖───╮
   ➤ {timeNow}
╰────────────────────╯

╭───❖ 🌅 𝐒𝐞𝐬𝐬𝐢𝐨𝐧 ❖───╮
   ➤ {session}
╰────────────────╯

╔══════════════════════╗
      👑 𝐀𝐃𝐌𝐈𝐍 👑
        Mehedi Hasan
╚══════════════════════╝

📖 “May Allah bless you in this group”
🤝 Respect Everyone
📌 Follow All Rules
💖 Stay Active & Enjoy

╔═══━━━─── • ───━━━═══╗
      🌸 𝐓𝐇𝐀𝐍𝐊 𝐘𝐎𝐔 🌸
╚═══━━━─── • ───━━━═══╝`
    }
  },

  onStart: async ({ threadsData, message, event, api, getLang }) => {
    if (event.logMessageType == "log:subscribe")
      return async function () {

        const hours = getTime("HH");
        const { threadID, author } = event;
        const dataAddedParticipants = event.logMessageData.addedParticipants;

        // If bot added
        if (dataAddedParticipants.some((item) => item.userFbId == api.getCurrentUserID())) {
          return message.send(getLang("welcomeMessage"));
        }

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

          const threadName = threadData.threadName;
          const memberCount = threadData.participantIDs.length;
          const timeNow = getTime("HH:mm:ss");
          const dataAddedParticipants = global.temp.welcomeEvent[threadID].dataAddedParticipants;

          const userName = [];
          const mentions = [];

          let multiple = false;
          if (dataAddedParticipants.length > 1)
            multiple = true;

          for (const user of dataAddedParticipants) {
            userName.push(user.fullName);
            mentions.push({
              tag: user.fullName,
              id: user.userFbId
            });
          }

          const uid = dataAddedParticipants.map(u => u.userFbId).join(", ");

          const addedByName = await new Promise(resolve => {
            api.getUserInfo(author, (err, info) => {
              if (err) resolve("Unknown");
              else resolve(info[author].name);
            });
          });

          let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

          welcomeMessage = welcomeMessage
            .replace(/\{userName\}/g, userName.join(", "))
            .replace(/\{boxName\}/g, threadName)
            .replace(/\{memberCount\}/g, memberCount)
            .replace(/\{uid\}/g, uid)
            .replace(/\{addedBy\}/g, addedByName)
            .replace(/\{timeNow\}/g, timeNow)
            .replace(
              /\{multiple\}/g,
              multiple ? getLang("multiple2") : getLang("multiple1")
            )
            .replace(
              /\{session\}/g,
              hours <= 10
                ? getLang("session1")
                : hours <= 12
                ? getLang("session2")
                : hours <= 18
                ? getLang("session3")
                : getLang("session4")
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
