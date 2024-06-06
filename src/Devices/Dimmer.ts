import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

/**
 * Creates a dimmer device.
 */
export class Dimmer extends Common<Baf.Dimmer> implements Device {
    private service: Service;

    /**
     * Creates a dimmer device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the discovered device.
     * @param log A refrence to the Homebridge logger.
     */
    constructor(homebridge: API, device: Baf.Dimmer, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.Lightbulb) ||
            this.accessory.addService(this.homebridge.hap.Service.Lightbulb, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.On).onGet(this.onGetState);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.Brightness)
            .onGet(this.onGetBrightness)
            .onSet(this.onSetBrightness);
    }

    /**
     * Updates Homebridge accessory when an update comes from the device.
     *
     * @param state The current dimmer state.
     */
    public onUpdate(state: Baf.DimmerState): void {
        this.log.debug(`Dimmer: ${this.device.name} State: ${state.state}`);
        this.log.debug(`Dimmer: ${this.device.name} Brightness: ${state.level}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.state === "On");
        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.Brightness, state.level);
    }

    /**
     * Fetches the current state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Dimmer Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "On";
    };

    /**
     * Fetches the current brightness when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetBrightness = (): CharacteristicValue => {
        this.log.debug(`Dimmer Get Brightness: ${this.device.name} ${this.device.status.level}`);

        return this.device.status.level;
    };

    /**
     * Updates the device when a change comes in from Homebridge.
     */
    private onSetBrightness = async (value: CharacteristicValue): Promise<void> => {
        const level = (value || 0) as number;
        const state = level > 0 ? "On" : "Off";

        if (this.device.status.state !== state || this.device.status.level !== level) {
            this.log.debug(`Dimmer Set State: ${this.device.name} ${state}`);
            this.log.debug(`Dimmer Set Brightness: ${this.device.name} ${level}`);

            await this.device.set({ state, level });
        }
    };
}
