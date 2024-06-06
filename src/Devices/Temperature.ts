import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Temperature extends Common<Baf.Temperature> implements Device {
    private service: Service;

    constructor(homebridge: API, device: Baf.Temperature, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.TemperatureSensor) ||
            this.accessory.addService(this.homebridge.hap.Service.TemperatureSensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature).onGet(this.onGetState);
    }

    public onUpdate(state: Baf.TemperatureState): void {
        this.log.debug(`Temperature: ${this.device.name} State: ${state.temprature}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature, state.temprature);
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Temperature Get State: ${this.device.name} ${this.device.status.temprature}`);

        return this.device.status.temprature;
    };
}
