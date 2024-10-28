import * as Baf from "@mkellsy/baf-client";

import { API, DynamicPlatformPlugin, Logging, PlatformAccessory, PlatformConfig } from "homebridge";
import { Device as IDevice, DeviceState } from "@mkellsy/hap-device";

import { Accessories } from "./Accessories";
import { Device } from "./Interfaces/Device";

const accessories: Map<string, PlatformAccessory> = new Map();
const devices: Map<string, Device> = new Map();

const platform: string = "Haiku";
const plugin: string = "@mkellsy/homebridge-haiku";

export { accessories, devices, platform, plugin };

/**
 * Impliments a Homebridge platform plugin.
 * @public
 */
export class Platform implements DynamicPlatformPlugin {
    private readonly log: Logging;
    private readonly homebridge: API;

    /**
     * Creates an instance to this plugin.
     *
     * @param log A reference to the Homebridge logger.
     * @param config A reference to this plugin's config.
     * @param homebridge A reference to the Homebridge API.
     */
    constructor(log: Logging, config: PlatformConfig, homebridge: API) {
        this.log = log;
        this.homebridge = homebridge;

        this.homebridge.on("didFinishLaunching", () => {
            Baf.connect().on("Available", this.onAvailable).on("Update", this.onUpdate);
        });
    }

    /**
     * Function to call when Homebridge findes a cached accessory that is
     * associated to this plugin.
     *
     * Note these accessories do not have extended data, the plugin wwill need
     * to re-initialize the device, and re-bind any listeners.
     *
     * @param accessory A reference to the cached accessory.
     */
    public configureAccessory(accessory: PlatformAccessory): void {
        accessories.set(accessory.UUID, accessory);
    }

    /*
     * mDNS discovery listener. This will create devices when found and will
     * register with Homebridge or re-initialize the accessory if it is from
     * the cache.
     */
    private onAvailable = (devices: IDevice[]): void => {
        for (const device of devices) {
            const accessory = Accessories.create(this.homebridge, device, this.log);

            accessory?.register();

            if (accessory == null) {
                Accessories.remove(this.homebridge, device);
            }
        }
    };

    /*
     * Device update listener. This recieves updates from the devices and will
     * relay the state to Homebridge.
     */
    private onUpdate = (device: IDevice, state: DeviceState): void => {
        const accessory = Accessories.get(this.homebridge, device);

        if (accessory == null || accessory.onUpdate == null) {
            return;
        }

        accessory.onUpdate(state);
    };
}
