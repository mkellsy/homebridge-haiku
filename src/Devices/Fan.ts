import { API, Logging, Service } from "homebridge";
import { DeviceState, Fan as IFan } from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Fan extends Common implements Device {
    private service: Service;

    constructor(homebridge: API, device: IFan, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.Fan) ||
            this.accessory.addService(this.homebridge.hap.Service.Fan, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
    }

    public onUpdate(state: DeviceState): void {
        this.log.debug(`Fan: ${this.device.name} State: ${state.state}`);
        this.log.debug(`Fan: ${this.device.name} Speed: ${state.speed}`);

        if (this.device.capabilities.auto) {
            this.log.debug(`Fan: ${this.device.name} Auto: ${state.auto}`);
        }

        if (this.device.capabilities.whoosh) {
            this.log.debug(`Fan: ${this.device.name} Whoosh: ${state.whoosh}`);
        }

        if (this.device.capabilities.eco) {
            this.log.debug(`Fan: ${this.device.name} Eco: ${state.eco}`);
        }

        // TODO
    }
}
