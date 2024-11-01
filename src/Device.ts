import { PlatformAccessory } from "homebridge";
import { DeviceState } from "@mkellsy/hap-device";

/**
 * Shared device interface for Homebridge accessories
 * @public
 */
export interface Device {
    /**
     * The UUID of the device.
     */
    id: string;

    /**
     * The associated HAP accessory.
     */
    accessory: PlatformAccessory;

    /**
     * Registers a device and if not cached, it will also inform Homebridge
     * about the device.
     */
    register(): void;

    /**
     * Updates Homebridge accessory when an update comes from the device.
     *
     * @param state The current device state.
     */
    onUpdate?(state: DeviceState): void;
}
