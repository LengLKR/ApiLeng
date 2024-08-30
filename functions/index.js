const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const line = require("@line/bot-sdk");
const { dialogflow } = require("actions-on-google");
const functions = require("firebase-functions");
// ตั้งค่า Line Bot SDK
const lineConfig = {
  channelAccessToken:
    "pGJXMK92+YhNxQ1pBFpk+RBwMAa4voF30YPb0NBST+hsu503dvNLLzkfRKLcG7gdFkbhLR2fqKX8q3WGX3nsbmVRTtgmPpRM1LqQk3n7R2+6WHO10oTbP65woC0oEEiUJpsMM6nQQG7Jou9FeIgr6wdB04t89/1O/w1cDnyilFU=",
  channelSecret: "66dc1e10c383150c10f61c4f72b4bbd1",
};

const client = new line.Client(lineConfig);

// สร้างแอป Dialogflow
const app = dialogflow({ debug: true });

// Example intent handler
app.intent("Default Welcome Intent", (conv) => {
  conv.ask("Hello! How can I help you?");
});

// ฟังก์ชันเพื่อรับ Webhook จาก LINE
exports.lineWebhook = functions.https.onRequest((req, res) => {
  const events = req.body.events;

  Promise.all(events.map(handleEvent))
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// ฟังก์ชันเพื่อจัดการเหตุการณ์จาก LINE
function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  const dialogflowRequest = {
    session: `projects/YOUR_PROJECT_ID/agent/sessions/${event.source.userId}`,
    queryInput: {
      text: {
        text: event.message.text,
        languageCode: "en",
      },
    },
  };

  return app.handler(dialogflowRequest, {}).then((response) => {
    const textResponse = response.queryResult.fulfillmentText;
    const message = {
      type: "text",
      text: textResponse,
    };
    return client.replyMessage(event.replyToken, message);
  });
}
