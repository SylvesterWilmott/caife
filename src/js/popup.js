"use strict";

import * as constants from "./constants.js";
import * as storage from "./storage.js";
import * as message from "./message.js";
import * as alarm from "./alarm.js";
import * as power from "./power.js";
import * as i18n from "./localize.js";

let listNavItems;
let navIndex; // Current navigation index

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await displayRunningAlarm();
  setupNavigation();
  setupListeners();
  i18n.localize();
}

function setupListeners() {
  let navItems = document.querySelectorAll(".nav-index");

  for (let item of navItems) {
    item.addEventListener("click", onNavItemClicked);
  }

  document.addEventListener("keydown", documentOnKeydown, false);
  document.addEventListener("mouseout", documentOnMouseout, false);
}

function documentOnKeydown(e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    navigateDirection(e);
  } else if (e.key === "Enter") {
    clickSelectedItem();
  }
}

async function onNavItemClicked(e) {
  let target = e.target;

  if (target.hasAttribute("data-duration")) {
    if (target.dataset.duration !== "infinite") {
      createAlarm(target.dataset.duration);
    }

    await storage.save("status", target.dataset.duration);

    power.keepAwake();
  } else {
    switch (target.id) {
      case "deactivate":
        power.releaseKeepAwake();
        await alarm.clear("alarm");
        await storage.clear("status");
        break;
    }
  }

  window.close();
}

function createAlarm(duration) {
  alarm.create("alarm", parseInt(duration));
}

async function displayRunningAlarm() {
  let groupEl = document.getElementById("runningAlarm");
  let status = await storage.load("status", null);
  let alarmObj = await alarm.get("alarm");

  console.log(alarmObj);

  if (alarmObj || status === "infinite") {
    let durationEl = document.getElementById("duration");

    groupEl.style.display = "block";

    if (alarmObj) {
      durationEl.innerText = getTimeLeftString(alarmObj.scheduledTime);
    } else {
      durationEl.innerText = constants.STR_DURATION_INFINITE;
    }

    if (status) {
      restoreCheckmark(status);
    }
  } else {
    groupEl.remove();
    await alarm.clear("alarm");
    await storage.clear("status");
  }
}

function restoreCheckmark(status) {
  document
    .querySelector('[data-duration="' + status + '"]')
    .classList.add("active");
}

function getTimeLeftString(scheduled) {
  let now = new Date().getTime();
  let timeLeft = scheduled - now;
  let minutes = Math.floor(timeLeft / (1000 * 60)) + 1;
  let formatted = getFormatted(minutes);

  return formatted + " " + constants.STR_TIME_REMAINING;
}

function getFormatted(duration) {
  let formatted = [];
  let hours = Math.floor(duration / 60);
  let minutes = duration % 60;
  let hoursStr;
  let minutesStr;

  if (duration === 0) {
    return duration.toString() + " " + constants.STR_MINUTES;
  }

  if (hours > 0) {
    if (hours === 1) {
      hoursStr = hours.toString() + " " + constants.STR_HOURS_S;
    } else {
      hoursStr = hours.toString() + " " + constants.STR_HOURS;
    }
  }

  if (minutes > 0) {
    if (minutes === 1) {
      minutesStr = minutes.toString() + " " + constants.STR_MINUTES_S;
    } else {
      minutesStr = minutes.toString() + " " + constants.STR_MINUTES;
    }
  }

  if (hoursStr) {
    formatted.push(hoursStr);
  }

  if (minutesStr) {
    formatted.push(minutesStr);
  }

  return formatted.join(", ");
}

function setupNavigation() {
  listNavItems = document.querySelectorAll(".nav-index");

  for (let [i, item] of listNavItems.entries()) {
    item.addEventListener(
      "mouseover",
      function (e) {
        removeAllSelections();
        this.classList.add("selected");
        navIndex = i;
      },
      false
    );
  }
}

function navigateDirection(e) {
  e.preventDefault();

  switch (e.key) {
    case "ArrowDown":
      setNavIndex();
      navigateListDown();
      break;
    case "ArrowUp":
      setNavIndex();
      navigateListUp();
      break;
  }

  if (navIndex <= 1) scrollToTop();
  if (navIndex >= listNavItems.length - 1) scrollToBottom();

  listNavItems[navIndex].classList.add("selected");
  listNavItems[navIndex].scrollIntoView({ block: "nearest" });
}

function setNavIndex() {
  if (!navIndex) {
    navIndex = 0;
  }
}

function navigateListDown() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== listNavItems.length - 1 ? navIndex++ : listNavItems.length - 1;
  } else {
    navIndex = 0;
  }
}

function navigateListUp() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== 0 ? navIndex-- : 0;
  } else {
    navIndex = listNavItems.length - 1;
  }
}

function clickSelectedItem(e) {
  let el = listNavItems[navIndex];
  el.click();
}

function removeAllSelections() {
  for (let item of listNavItems) {
    item.classList.remove("selected");
  }

  navIndex = null;
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function documentOnMouseout(e) {
  removeAllSelections();
}
