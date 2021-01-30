"use strict";
const express = require("express");
const { dialogflow, Permission } = require("actions-on-google");
const bodyParser = require("body-parser");
const axios = require("axios").default;
const fetch = require("node-fetch");
const port = process.env.PORT || 3000;
// const app = dialogflow({ debug:true });
const { conversation, Image } = require("@assistant/conversation");

const API_URL = "http://air4thai.pcd.go.th/services/getNewAQI_JSON.php";
const STATION_ID = "bkp99t";

const app = conversation();

function getAQILevelText(aqiLevel) {
  if (aqiLevel <= 25) {
    return "Excellent";
  } else if (aqiLevel <= 50) {
    return "Satisfactory";
  } else if (aqiLevel <= 100) {
    return "Moderate";
  } else if (aqiLevel <= 200) {
    return "Unhealthy";
  } else {
    return "Very Unhealthy";
  }
}

function fetchPollutionLevel() {
  return new Promise(function (resolve, reject) {
    console.log("fetching pollution");
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        const stationInfo = json.stations.filter(
          (s) => s.stationID == STATION_ID
        )[0];
        console.log(stationInfo);
        resolve(stationInfo);
      })
      .catch(reject);
  });
}

app.handle("AIR_QUALITY", (conv) => {
  console.log("incoming AIR_QUALTY invoke ", JSON.stringify(conv, null, 2));
  // conv.add("Hello world!!");

  // const options = {
  //   context: "location permission",
  //   permissions: ["DEVICE_PRECISE_LOCATION"],
  // };
  // const permission = new Permission(options);
  // console.log("permission", permission);
  // conv.add(permission);

  fetchPollutionLevel()
    .then((res) => {
      conv.add(
        `Air quality at ${res.nameEN} is ${getAQILevelText(
          res.LastUpdate.AQI.aqi
        )} with the aqi of ${res.LastUpdate.AQI.aqi}.`
      );
      conv.add(
        `PM 2.5 concentration is ${res.LastUpdate.PM25.value} ${res.LastUpdate.PM25.unit}.`
      );
    })
    .catch((err) => console.log(err));
});

// app.intent("actions.intent.MAIN", (conv) => {
//   console.log("incoming AIR_QUALTY invoke ", JSON.stringify(conv, null, 2));
//   conv.add("Hello world!!");

//   const options = {
//     context: "location permission",
//     permissions: ["DEVICE_PRECISE_LOCATION"],
//   };
//   conv.ask(new Permission(options));
// });

// app.intent("ASK_AIR_QUALITY", (conv) => {
//   console.log("incoming AIR_QUALTY invoke ", JSON.stringify(conv, null, 2));
//   conv.add("Hello world!!");

//   const options = {
//     context: "location permission",
//     permissions: ["DEVICE_PRECISE_LOCATION"],
//   };
//   conv.ask(new Permission(options));
// });

const expressApp = express().use(bodyParser.json());
expressApp.post("/webhook", app);

expressApp.get("/", (req, res) => {
  // res.send("Hello World");
  fetchPollutionLevel()
    .then((pollutionRes) => {
      console.log(pollutionRes.LastUpdate.AQI);
      const res1 = `Air quality at ${pollutionRes.nameEN} is ${getAQILevelText(
        pollutionRes.LastUpdate.AQI.aqi
      )} with the aqi of ${pollutionRes.LastUpdate.AQI.aqi}.`;
      const res2 = `PM 2.5 concentration is ${pollutionRes.LastUpdate.PM25.value} ${pollutionRes.LastUpdate.PM25.unit}.`;
      res.send(JSON.stringify(pollutionRes, null, 2) + "<br>" + res1 + "<br>" + res2);
    })
    .catch((err) => console.log(err));
});

expressApp.listen(port);
