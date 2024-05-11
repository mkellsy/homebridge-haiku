import { PlatformAccessory } from "homebridge";
import { DeviceState } from "@mkellsy/hap-device";

export interface Device {
    id: string;
    accessory: PlatformAccessory;

    register(): void;

    onUpdate?(state: DeviceState): void;
}
