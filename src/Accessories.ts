import * as HAP from "@mkellsy/hap-device";
import * as Baf from "@mkellsy/baf-client";

import { API, Logging } from "homebridge";

import { accessories, devices, platform, plugin } from "./Platform";

import { Fan } from "./Fan";
import { Dimmer } from "./Dimmer";
import { Humidity } from "./Humidity";
import { Occupancy } from "./Occupancy";
import { Switch } from "./Switch";
import { Temperature } from "./Temperature";

import { Device } from "./Device";

/**
 * Accessory factory.
 * @private
 */
export abstract class Accessories {
    /**
     * Creates respective devices from a common device discovery.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the common device object.
     * @param log A reference to the Homebridge logger.
     *
     * @returns A device or undefined if not configured.
     */
    public static create(homebridge: API, device: HAP.Device, log: Logging): Device | undefined {
        switch (device.type) {
            case HAP.DeviceType.Fan:
                return new Fan(homebridge, device as Baf.Fan, log);

            case HAP.DeviceType.Dimmer:
                return new Dimmer(homebridge, device as Baf.Dimmer, log);

            case HAP.DeviceType.Switch:
                return new Switch(homebridge, device as Baf.Switch, log);

            case HAP.DeviceType.Humidity:
                return new Humidity(homebridge, device as Baf.Humidity, log);

            case HAP.DeviceType.Occupancy:
                return new Occupancy(homebridge, device as Baf.Occupancy, log);

            case HAP.DeviceType.Temperature:
                return new Temperature(homebridge, device as Baf.Temperature, log);
        }

        return undefined;
    }

    /**
     * Fetches an internally cached device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the common device object.
     *
     * @returns The cached device or undefined if not available.
     */
    public static get(homebridge: API, device: HAP.Device): Device | undefined {
        const id = homebridge.hap.uuid.generate(device.id);

        return devices.get(id);
    }

    /**
     * Removes an internally cached device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the common device object.
     */
    public static remove(homebridge: API, device: HAP.Device): void {
        const id = homebridge.hap.uuid.generate(device.id);
        const accessory = accessories.get(id);

        if (accessory != null) {
            homebridge.unregisterPlatformAccessories(plugin, platform, [accessory]);
        }
    }
}
