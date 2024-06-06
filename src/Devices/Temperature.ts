import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

/**
 * Creates a temperature sensor device.
 */
export class Temperature extends Common<Baf.Temperature> implements Device {
    private service: Service;

    /**
     * Creates a temperature sensor device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the discovered device.
     * @param log A refrence to the Homebridge logger.
     */
    constructor(homebridge: API, device: Baf.Temperature, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.TemperatureSensor) ||
            this.accessory.addService(this.homebridge.hap.Service.TemperatureSensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature).onGet(this.onGetState);
    }

    /**
     * Updates Homebridge accessory when an update comes from the device.
     *
     * @param state The current temperature sensor state.
     */
    public onUpdate(state: Baf.TemperatureState): void {
        this.log.debug(`Temperature: ${this.device.name} State: ${state.temprature}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature, state.temprature);
    }

    /**
     * Fetches the current state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Temperature Get State: ${this.device.name} ${this.device.status.temprature}`);

        return this.device.status.temprature;
    };
}
