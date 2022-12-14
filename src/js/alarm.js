"use strict";

export function create(name, delay) {
  chrome.alarms.create(name, { delayInMinutes: delay });
}

export function clear(name) {
  return new Promise((resolve, reject) => {
    chrome.alarms.clear(name, function () {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
      resolve();
    });
  });
}

export function get(name) {
  return new Promise((resolve, reject) => {
    chrome.alarms.get(name, function (alarm) {
      if (chrome.runtime.lastError) {
        console.log(chrome.runtime.lastError.message);
      }
      resolve(alarm);
    });
  });
}
