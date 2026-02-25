const axios = require("axios");
const { getStreamFromURL, shortenURL } = global.utils;

async function fetchTikTokVideos(query) {
  try {
    const response = await axios.get(`https://lyric-search-neon.vercel.app/kshitiz?keyword=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  config: {
    name: "lyricvideo",
    aliases: ["lv"],
    author: "Nazim Fixed",
    version: "2.0",
    shortDescription: {
      en: "Play Lyric Video (Short + Long)"
    },
    longDescription: {
      en: "Search & Send Beautiful Lyric Video"
    },
    category: "fun",
    guide: {
      en: "{p}{n} [song name] or reply to audio/video"
    }
  },

  onStart: async function ({ api, event, args }) {

    const emojiReact = [
      "🎧","🎶","🎵","✨","💫","🔥",
      "📀","🎤","🖤","🌈","⚡","💥",
      "📹","🎬"
    ];

    api.setMessageReaction(
      emojiReact[Math.floor(Math.random() * emojiReact.length)],
      event.messageID,
      () => {},
      true
    );

    try {

      let query = "";

      // ===== Reply to audio/video =====
      if (event.messageReply && event.messageReply.attachments.length > 0) {
        const attachment = event.messageReply.attachments[0];

        if (attachment.type === "video" || attachment.type === "audio") {

          const shortUrl = await shortenURL(attachment.url);

          const musicRecognition = await axios.get(
            `https://audio-reco.onrender.com/kshitiz?url=${encodeURIComponent(shortUrl)}`
          );

          query = musicRecognition.data.title;

        } else {
          return api.sendMessage(
            "❌ Reply only to audio or video.",
            event.threadID,
            event.messageID
          );
        }
      }

      // ===== Text search =====
      else if (args.length > 0) {
        query = args.join(" ");
      }

      else {
        return api.sendMessage(
          "⚠️ Please provide a song name or reply to an audio/video.",
          event.threadID,
          event.messageID
        );
      }

      // ===== Better search for long + short =====
      const finalQuery = `${query} lyrics video edit`;

      const videos = await fetchTikTokVideos(finalQuery);

      if (!videos || videos.length === 0) {
        return api.sendMessage(
          `❌ No lyric video found for: ${query}`,
          event.threadID,
          event.messageID
        );
      }

      // ===== Random Pick =====
      const selectedVideo =
        videos[Math.floor(Math.random() * videos.length)];

      const videoUrl = selectedVideo.videoUrl;

      if (!videoUrl) {
        return api.sendMessage(
          "❌ Video not found!",
          event.threadID,
          event.messageID
        );
      }

      const videoStream = await getStreamFromURL(videoUrl);

      api.sendMessage(
        {
          body:
`🎶 𝗟𝗬𝗥𝗜𝗖 𝗩𝗜𝗗𝗘𝗢 🎶

✨ Now Playing: ${query}
📀 Enjoy the Music... 🖤`,
          attachment: videoStream
        },
        event.threadID,
        event.messageID
      );

    } catch (e) {
      console.log(e);
      api.sendMessage(
        "❌ Error while fetching lyric video!\nTry again later.",
        event.threadID,
        event.messageID
      );
    }
  }
};
