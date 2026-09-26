const { VK } = require("vk-io");
const axios = require("axios");

const vk = new VK({
  token: process.env.VK_TOKEN
});

async function translate(text, target) {
  const response = await axios.post(
    process.env.TRANSLATE_URL,
    {
      q: text,
      source: "auto",
      target: target,
      format: "text"
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.translatedText;
}

vk.updates.on("message_new", async (context) => {

  console.log("==========");
  console.log("Neue Nachricht");
  console.log("Text:", context.text);
  console.log("isChat:", context.isChat);
  console.log("peerId:", context.peerId);

 // if (!context.isChat) return;

  if (context.isOutbox) return;

  const text = context.text;

  if (!text || text.trim() === "") return;

  try {

    const isRussian = /[а-яА-ЯЁё]/.test(text);

    let translated;

    if (isRussian) {
      translated = await translate(text, "en");
      await context.send(`🌐 EN:\n${translated}`);
    } else {
      translated = await translate(text, "ru");
      await context.send(`🌐 RU:\n${translated}`);
    }

  } catch (err) {
    console.log("Fehler:", err.message);
  }

});

vk.updates.start()
  .then(() => {
    console.log("Bot läuft");
    console.log("DEBUG VERSION 1");
  })
  .catch(console.error);
