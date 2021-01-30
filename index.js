"use strict";
const express = require("express");
const { actionssdk, Permission } = require("actions-on-google");
const bodyParser = require("body-parser");
const port = process.env.PORT || 3000;
// const app = dialogflow({ debug:true });
const { conversation, Image } = require("@assistant/conversation");

const app = actionssdk(); //conversation();

app.handle("AIR_QUALITY", (conv) => {
  console.log("incoming AIR_QUALTY invoke ", JSON.stringify(conv));
  conv.add("Hello world!!");

  const options = {
    context: "location permission",
    permissions: ["DEVICE_PRECISE_LOCATION"],
  };
  conv.add(new Permission(options));
});

app.intent("actions.intent.ASK_AIR_QUALITY", (conv) => {
  console.log("incoming AIR_QUALTY invoke ", JSON.stringify(conv));
  conv.add("Hello world!!");

  const options = {
    context: "location permission",
    permissions: ["DEVICE_PRECISE_LOCATION"],
  };
  conv.add(new Permission(options));
});

const expressApp = express().use(bodyParser.json());
expressApp.post("/webhook", app);
expressApp.get("/", (req, res) => {
  res.send("Hello World!");
});

expressApp.listen(port);
