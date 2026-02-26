const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "vip",
    version: "2.0.0",
    author: "Gaming Nazim",
    role: 2, // Only Admin can use
    shortDescription: "VIP Management System",
    category: "admin",
    guide: {
      en: "{pn} add @user\n{pn} remove @user\n{pn} list"
    }
  },

  onStart: async function ({ api, event, message, args }) {

    const vipPath = path.join(__dirname, "cache", "vip.json");
    const cacheDir = path.join(__dirname, "cache");

    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    if (!fs.existsSync(vipPath)) fs.writeFileSync(vipPath, JSON.stringify([]));

    let vipData = JSON.parse(fs.readFileSync(vipPath));
    const mention = Object.keys(event.mentions);
    const action = args[0];

    if (!action) {
      return message.reply("⚡ Usage:\n!vip add @user\n!vip remove @user\n!vip list");
    }

    // ✅ ADD VIP
    if (action === "add") {
      if (!mention[0]) return message.reply("⚠️ Please tag a user!");

      if (vipData.includes(mention[0])) {
        return message.reply("⚠️ User Already VIP!");
      }

      vipData.push(mention[0]);
      fs.writeFileSync(vipPath, JSON.stringify(vipData, null, 2));

      return message.reply("✅ User Successfully Added To VIP List!");
    }

    // ❌ REMOVE VIP
    if (action === "remove") {
      if (!mention[0]) return message.reply("⚠️ Please tag a user!");

      if (!vipData.includes(mention[0])) {
        return message.reply("⚠️ This user is not VIP!");
      }

      vipData = vipData.filter(id => id !== mention[0]);
      fs.writeFileSync(vipPath, JSON.stringify(vipData, null, 2));

      return message.reply("❌ User Removed From VIP List!");
    }

    // 📜 VIP LIST
    if (action === "list") {
      if (!vipData.length) return message.reply("❌ No VIP Users Found!");

      let msg = "💎 VIP USER LIST 💎\n\n";
      vipData.forEach((id, i) => {
        msg += `${i + 1}. ${id}\n`;
      });

      return message.reply(msg);
    }
  }
};
