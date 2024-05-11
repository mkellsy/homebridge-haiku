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

export class Platform implements DynamicPlatformPlugin {
    private readonly log: Logging;
    private readonly homebridge: API;

    constructor(log: Logging, _config: PlatformConfig, homebridge: API) {
        this.log = log;
        this.homebridge = homebridge;

        this.homebridge.on("didFinishLaunching", () => {
            Baf.connect().on("Available", this.onAvailable).on("Update", this.onUpdate);
        });
    }

    public configureAccessory(accessory: PlatformAccessory): void {
        accessories.set(accessory.UUID, accessory);
    }

    private onAvailable = (devices: IDevice[]): void => {
        for (const device of devices) {
            const accessory = Accessories.create(this.homebridge, device, this.log);

            accessory?.register();

            if (accessory == null) {
                Accessories.remove(this.homebridge, device);
            }
        }
    };

    private onUpdate = (device: IDevice, state: DeviceState): void => {
        const accessory = Accessories.get(this.homebridge, device);

        if (accessory == null || accessory.onUpdate == null) {
            return;
        }

        accessory.onUpdate(state);
    };
}
