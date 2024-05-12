import { API, CharacteristicValue, Logging, Service } from "homebridge";
import { DeviceState, Fan as IFan } from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

export class Fan extends Common implements Device {
    private service: Service;

    private auto?: Service;
    private whoosh?: Service;
    private eco?: Service;

    constructor(homebridge: API, device: IFan, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.Fan) ||
            this.accessory.addService(this.homebridge.hap.Service.Fan, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.On)
            .onGet(this.onGetState);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.RotationSpeed)
            .onGet(this.onGetSpeed)
            .onSet(this.onSetSpeed);

        if (this.device.capabilities.auto) {
            const control = `${this.device.name} Auto`;

            this.auto =
                this.accessory.getServiceById(this.homebridge.hap.Service.Switch, control) ||
                this.accessory.addService(this.homebridge.hap.Service.Switch, control, String(1));

            this.auto.setCharacteristic(this.homebridge.hap.Characteristic.Name, "Auto");
            this.auto.setCharacteristic(this.homebridge.hap.Characteristic.ConfiguredName, "Auto");

            this.auto
                .getCharacteristic(this.homebridge.hap.Characteristic.On)
                .onGet(this.onGetAuto)
                .onSet(this.onSetAuto);
        }

        if (this.device.capabilities.whoosh) {
            const control = `${this.device.name} Whoosh`;

            this.whoosh =
                this.accessory.getServiceById(this.homebridge.hap.Service.Switch, control) ||
                this.accessory.addService(this.homebridge.hap.Service.Switch, control, String(2));

            this.whoosh.setCharacteristic(this.homebridge.hap.Characteristic.Name, "Whoosh");
            this.whoosh.setCharacteristic(this.homebridge.hap.Characteristic.ConfiguredName, "Whoosh");

            this.whoosh
                .getCharacteristic(this.homebridge.hap.Characteristic.On)
                .onGet(this.onGetWhoosh)
                .onSet(this.onSetWhoosh);
        }

        if (this.device.capabilities.eco) {
            const control = `${this.device.name} Eco`;

            this.eco =
                this.accessory.getServiceById(this.homebridge.hap.Service.Switch, control) ||
                this.accessory.addService(this.homebridge.hap.Service.Switch, control, String(3));

            this.eco.setCharacteristic(this.homebridge.hap.Characteristic.Name, "Eco");
            this.eco.setCharacteristic(this.homebridge.hap.Characteristic.ConfiguredName, "Eco");

            this.eco
                .getCharacteristic(this.homebridge.hap.Characteristic.On)
                .onGet(this.onGetEco)
                .onSet(this.onSetEco);
        }
    }

    public onUpdate(state: DeviceState): void {
        const speed = Math.round(((state.speed || 0) / 7) * 100);

        this.log.debug(`Fan: ${this.device.name} State: ${state.state}`);
        this.log.debug(`Fan: ${this.device.name} Speed: ${state.speed || 0}`);

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.state === "On");
        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.RotationSpeed, speed);

        if (this.device.capabilities.auto) {
            this.log.debug(`Fan: ${this.device.name} Auto: ${state.auto || "Off"}`);

            this.auto?.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.auto === "On");
        }

        if (this.device.capabilities.whoosh) {
            this.log.debug(`Fan: ${this.device.name} Whoosh: ${state.whoosh || "Off"}`);

            this.whoosh?.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.whoosh === "On");
        }

        if (this.device.capabilities.eco) {
            this.log.debug(`Fan: ${this.device.name} Eco: ${state.eco || "Off"}`);

            this.eco?.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.eco === "On");
        }
    }

    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Fan Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "On";
    };

    private onGetSpeed = (): CharacteristicValue => {
        const speed = Math.round(((this.device.status.speed || 0) / 7) * 100);

        this.log.debug(`Fan Get Speed: ${this.device.name} ${this.device.status.speed || 0}`);

        return speed;
    };

    private onSetSpeed = (value: CharacteristicValue): void => {
        const speed = Math.round((((value as number) || 0) / 100) * 7);
        const state = speed > 0 ? "On" : "Off";
        const auto = "Off";
        const whoosh = this.device.status.whoosh || "Off";
        const eco = this.device.status.eco || "Off";

        this.log.debug(`Fan Set Speed: ${this.device.name} ${speed}`);

        this.device.set({ state, speed, auto, whoosh, eco });
    };

    private onGetAuto = (): CharacteristicValue => {
        this.log.debug(`Fan Get Auto: ${this.device.name} ${this.device.status.auto || "Off"}`);

        return this.device.status.auto === "On";
    };

    private onSetAuto = (value: CharacteristicValue): void => {
        const state = this.device.status.state;
        const speed = this.device.status.speed || 0;
        const auto = value ? "On" : "Off";
        const whoosh = this.device.status.whoosh || "Off";
        const eco = this.device.status.eco || "Off";

        this.log.debug(`Fan Set Auto: ${this.device.name} ${auto}`);

        this.device.set({ state, speed, auto, whoosh, eco });
    };

    private onGetWhoosh = (): CharacteristicValue => {
        this.log.debug(`Fan Get Whoosh: ${this.device.name} ${this.device.status.whoosh || "Off"}`);

        return this.device.status.whoosh === "On";
    };

    private onSetWhoosh = (value: CharacteristicValue): void => {
        const state = this.device.status.state;
        const speed = this.device.status.speed || 0;
        const auto = "Off";
        const whoosh = value ? "On" : "Off";
        const eco = this.device.status.eco || "Off";

        this.log.debug(`Fan Set Whoosh: ${this.device.name} ${whoosh}`);

        this.device.set({ state, speed, auto, whoosh, eco });
    };

    private onGetEco = (): CharacteristicValue => {
        this.log.debug(`Fan Get Eco: ${this.device.name} ${this.device.status.eco || "Off"}`);

        return this.device.status.eco === "On";
    };

    private onSetEco = (value: CharacteristicValue): void => {
        const state = this.device.status.state;
        const speed = this.device.status.speed || 0;
        const auto = "Off";
        const whoosh = this.device.status.whoosh || "Off";
        const eco = value ? "On" : "Off";

        this.log.debug(`Fan Set Eco: ${this.device.name} ${eco}`);

        this.device.set({ state, speed, auto, whoosh, eco });
    };
}
