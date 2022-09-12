"use strict";

import * as storage from "./js/storage.js";
import * as power from "./js/power.js";

chrome.alarms.onAlarm.addListener(onAlarmComplete);
chrome.runtime.onStartup.addListener(onStartup);

async function onAlarmComplete(alarm) {
  if (alarm.name === "alarm") {
    await clearAlarmAndStorage();
  }
}

async function onStartup() {
  await clearAlarmAndStorage();
}

async function clearAlarmAndStorage() {
  await storage.clear("status");
  power.releaseKeepAwake();
}
