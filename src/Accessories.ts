import * as Baf from "@mkellsy/baf-client";

import { API, Logging } from "homebridge";
import { DeviceType, Device as IDevice } from "@mkellsy/hap-device";

import { accessories, devices, platform, plugin } from "./Platform";

import { Fan } from "./Devices/Fan";
import { Dimmer } from "./Devices/Dimmer";
import { Humidity } from "./Devices/Humidity";
import { Occupancy } from "./Devices/Occupancy";
import { Switch } from "./Devices/Switch";
import { Temperature } from "./Devices/Temperature";

import { Device } from "./Interfaces/Device";

export abstract class Accessories {
    public static create(homebridge: API, device: IDevice, log: Logging): Device | undefined {
        switch (device.type) {
            case DeviceType.Fan:
                return new Fan(homebridge, device as Baf.Fan, log);

            case DeviceType.Dimmer:
                return new Dimmer(homebridge, device as Baf.Dimmer, log);

            case DeviceType.Switch:
                return new Switch(homebridge, device as Baf.Switch, log);

            case DeviceType.Humidity:
                return new Humidity(homebridge, device as Baf.Humidity, log);

            case DeviceType.Occupancy:
                return new Occupancy(homebridge, device as Baf.Occupancy, log);

            case DeviceType.Temperature:
                return new Temperature(homebridge, device as Baf.Temperature, log);
        }

        return undefined;
    }

    public static get(homebridge: API, device: IDevice): Device | undefined {
        const id = homebridge.hap.uuid.generate(device.id);

        return devices.get(id);
    }

    public static remove(homebridge: API, device: IDevice): void {
        const id = homebridge.hap.uuid.generate(device.id);
        const accessory = accessories.get(id);

        if (accessory != null) {
            homebridge.unregisterPlatformAccessories(plugin, platform, [accessory]);
        }
    }
}
