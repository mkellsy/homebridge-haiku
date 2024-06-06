import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Humidity extends Common<Baf.Humidity> implements Device {
    private service: Service;

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

    public onUpdate(state: Baf.HumidityState): void {
        this.log.debug(`Humidity: ${this.device.name} State: ${state.humidity}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.CurrentRelativeHumidity, state.humidity);
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Humidity Get State: ${this.device.name} ${this.device.status.humidity}`);

        return this.device.status.humidity;
    };
}
