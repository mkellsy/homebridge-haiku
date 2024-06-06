import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Occupancy extends Common<Baf.Occupancy> implements Device {
    private service: Service;

    constructor(homebridge: API, device: Baf.Occupancy, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.OccupancySensor) ||
            this.accessory.addService(this.homebridge.hap.Service.OccupancySensor, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.OccupancyDetected).onGet(this.onGetState);
    }

    public onUpdate(state: Baf.OccupancyState): void {
        this.log.debug(
            `Occupancy: ${this.device.name} State: ${state.state === "Occupied" ? "Detected" : "Not Detected"}`,
        );

        this.service.updateCharacteristic(
            this.homebridge.hap.Characteristic.OccupancyDetected,
            state.state === "Occupied",
        );
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Occupancy Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "Occupied";
    };
}
