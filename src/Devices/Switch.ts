import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Switch extends Common<Baf.Switch> implements Device {
    private service: Service;

    constructor(homebridge: API, device: Baf.Switch, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.Switch) ||
            this.accessory.addService(this.homebridge.hap.Service.Switch, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.On)
            .onGet(this.onGetState)
            .onSet(this.onSetState);
    }

    public onUpdate(state: Baf.SwitchState): void {
        this.log.debug(`Switch: ${this.device.name} state: ${state.state}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.state === "On");
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Switch Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "On";
    };

    private onSetState = async (value: CharacteristicValue): Promise<void> => {
        const state = value ? "On" : "Off";

        if (this.device.status.state !== state) {
            this.log.debug(`Switch Set State: ${this.device.name} ${state}`);

            await this.device.set({ state });
        }
    };
}
