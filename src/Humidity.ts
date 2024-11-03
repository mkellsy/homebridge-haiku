import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "./Device";

/**
 * Creates a humidity sensor device.
 * @private
 */
export class Humidity extends Common<Baf.Humidity> implements Device {
    private service: Service;

    /**
     * Creates a humidity sensor device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the discovered device.
     * @param log A refrence to the Homebridge logger.
     */
    constructor(homebridge: API, device: Baf.Humidity, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.HumiditySensor) ||
            this.accessory.addService(this.homebridge.hap.Service.HumiditySensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity)
            .onGet(this.onGetState);
    }

    /**
     * Updates Homebridge accessory when an update comes from the device.
     *
     * @param state The current humidity sensor state.
     */
    public onUpdate(state: Baf.HumidityState): void {
        this.log.debug(`Humidity: ${this.device.name} State: ${state.humidity}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity, state.humidity);
    }

    /**
     * Fetches the current state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Humidity Get State: ${this.device.name} ${this.device.status.humidity}`);

        return this.device.status.humidity;
    };
}
