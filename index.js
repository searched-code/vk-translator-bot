const { VK } = require("vk-io");
const axios = require("axios");

const vk = new VK({
  token: process.env.VK_TOKEN
});

async function translate(text, target) {
  const response = await axios.post(
    "https://api-free.deepl.com/v2/translate",
    {
      text: [text],
      target_lang: target
    },
    {
      headers: {
        "Authorization": `DeepL-Auth-Key ${process.env.DEEPL_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.translations[0].text;
}

vk.updates.on("message_new", async (context) => {

  // Nur Gruppenchats
  if (!context.isChat) return;

  // Eigene Nachrichten ignorieren
  if (context.isOutbox) return;

  const text = context.text;

  if (!text || text.trim() === "") return;

  // Nur Nachrichten mit !t übersetzen
  if (!text.startsWith("!t ")) return;

  try {

    const originalText = text.substring(3).trim();

    if (!originalText) return;

    const isRussian = /[а-яА-ЯЁё]/.test(originalText);

    let translated;

    if (isRussian) {
      translated = await translate(originalText, "EN");
      await context.send(`🌐 EN:\n${translated}`);
    } else {
      translated = await translate(originalText, "RU");
      await context.send(`🌐 RU:\n${translated}`);
    }

  } catch (err) {
    console.log("Fehler:", err.message);
  }

});

vk.updates.start()
  .then(() => {
    console.log("Bot läuft");
  })
  .catch(console.error);
