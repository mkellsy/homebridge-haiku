/**
 * This is a plugin that exposes Big Ass Fans Haiku and i6 fans to Homebridge.
 *
 * @packageDocumentation
 */

import { API } from "homebridge";
import { Platform, platform, plugin } from "./Platform";

/**
 * Defines an entrypoint for Homebridge and registers a Platform object.
 *
 * @param homebridge - A reference to the Homebridge API.
 * @public
 */
export = (homebridge: API) => {
    homebridge.registerPlatform(plugin, platform, Platform);
};
