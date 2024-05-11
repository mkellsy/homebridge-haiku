import { API, Logging } from "homebridge";
import { DeviceType, Device as IDevice, Keypad as IKeypad } from "@mkellsy/hap-device";

import { accessories, devices, platform, plugin } from "./Platform";

import { Fan } from "./Devices/Fan";
import { Dimmer } from "./Devices/Dimmer";
import { Humidity } from "./Devices/Humidity";
import { Occupancy } from "./Devices/Occupancy";
import { Temperature } from "./Devices/Temperature";

import { Device } from "./Interfaces/Device";

export abstract class Accessories {
    public static create(homebridge: API, device: IDevice, log: Logging): Device | undefined {
        switch (device.type) {
            case DeviceType.Fan:
                return new Fan(homebridge, device, log);

            case DeviceType.Dimmer:
                return new Dimmer(homebridge, device, log);

            case DeviceType.Humidity:
                return new Humidity(homebridge, device as IKeypad, log);

            case DeviceType.Occupancy:
                return new Occupancy(homebridge, device, log);

            case DeviceType.Temperature:
                return new Temperature(homebridge, device, log);
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
