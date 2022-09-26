"use strict";

import * as storage from "./js/storage.js";
import * as alarm from "./js/alarm.js";
import * as power from "./js/power.js";

chrome.alarms.onAlarm.addListener(onAlarmComplete);
chrome.runtime.onInstalled.addListener(onStartup);
chrome.runtime.onStartup.addListener(onStartup);
chrome.runtime.onMessage.addListener(onPopupMessage);

async function onAlarmComplete(alarm) {
  if (alarm.name === "alarm") {
    await clearAlarmAndStorage();
    updateIcon("disabled");
  }
}

async function onStartup() {
  await clearAlarmAndStorage();
}

function onPopupMessage(message, sender, sendResponse) {
  switch (message.active) {
    case true:
      updateIcon("active");
      break;
    case false:
      updateIcon("disabled");
      break;
  }

  sendResponse();
}

async function clearAlarmAndStorage() {
  power.releaseKeepAwake();
  await alarm.clear("alarm");
  await storage.clear("status");
}

function updateIcon(status) {
  switch (status) {
    case "active":
      chrome.action.setIcon({ path: "./images/icon32_active.png" });
      break;
    case "disabled":
      chrome.action.setIcon({ path: "./images/icon32.png" });
      break;
  }
}
