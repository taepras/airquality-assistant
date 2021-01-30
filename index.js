'use strict';
const express = require('express');
// const { dialogflow } = require('actions-on-google');
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000;
// const app = dialogflow({ debug:true });
const { conversation, Image } = require("@assistant/conversation");

const app = conversation();

app.handle("AIR_QUALITY", (conv) => {
  console.log("incoming AIR_QUALTY invoke ", JSON.stringify(conv));
  conv.add("Hello world!!");
});

const expressApp = express().use(bodyParser.json());
expressApp.post("/webhook", app);
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});

expressApp.listen(port);