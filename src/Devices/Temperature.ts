import { API, CharacteristicValue, Logging, Service } from "homebridge";
import { DeviceState, Temperature as ITemperature } from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Temperature extends Common implements Device {
    private service: Service;

    constructor(homebridge: API, device: ITemperature, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.TemperatureSensor) ||
            this.accessory.addService(this.homebridge.hap.Service.TemperatureSensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature).onGet(this.onGetState);
    }

    public onUpdate(state: DeviceState): void {
        this.log.debug(`Temperature: ${this.device.name} State: ${state.temprature || 0}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.CurrentTemperature, state.temprature || 0);
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Temperature Get State: ${this.device.name} ${this.device.status.temprature || 0}`);

        return this.device.status.temprature || 0;
    };
}
