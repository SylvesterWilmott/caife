"use strict";

import * as constants from "./constants.js";

export function keepAwake() {
  chrome.power.requestKeepAwake(constants.AWAKE_STATE);
}

export function releaseKeepAwake() {
  chrome.power.releaseKeepAwake();
}
