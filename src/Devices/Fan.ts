import * as Baf from "@mkellsy/baf-client";

import { API, CharacteristicValue, Logging, Service } from "homebridge";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";

/**
 * Creates a fan device.
 */
export class Fan extends Common<Baf.Fan> implements Device {
    private service: Service;

    private auto?: Service;
    private whoosh?: Service;
    private eco?: Service;

    /**
     * Creates a fan device.
     *
     * @param homebridge A reference to the Homebridge API.
     * @param device A reference to the discovered device.
     * @param log A refrence to the Homebridge logger.
     */
    constructor(homebridge: API, device: Baf.Fan, log: Logging) {
        super(homebridge, device, log);

        this.service =
            this.accessory.getService(this.homebridge.hap.Service.Fan) ||
            this.accessory.addService(this.homebridge.hap.Service.Fan, this.device.name);

        this.service.setCharacteristic(this.homebridge.hap.Characteristic.Name, this.device.name);
        this.service.getCharacteristic(this.homebridge.hap.Characteristic.On).onGet(this.onGetState);

        this.service
            .getCharacteristic(this.homebridge.hap.Characteristic.RotationSpeed)
            .onGet(this.onGetSpeed)
            .onSet(this.onSetSpeed);

        if (this.device.capabilities.auto) {
            const control = `${this.device.name} Auto`;

            this.auto =
                this.accessory.getService(control) ||
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
                this.accessory.getService(control) ||
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
                this.accessory.getService(control) ||
                this.accessory.addService(this.homebridge.hap.Service.Switch, control, String(3));

            this.eco.setCharacteristic(this.homebridge.hap.Characteristic.Name, "Eco");
            this.eco.setCharacteristic(this.homebridge.hap.Characteristic.ConfiguredName, "Eco");

            this.eco.getCharacteristic(this.homebridge.hap.Characteristic.On).onGet(this.onGetEco).onSet(this.onSetEco);
        }
    }

    /**
     * Updates Homebridge accessory when an update comes from the device.
     *
     * @param state The current fan state.
     */
    public onUpdate(state: Baf.FanState): void {
        const speed = Math.round((state.speed / 7) * 100);

        this.log.debug(`Fan: ${this.device.name} State: ${state.state}`);
        this.log.debug(`Fan: ${this.device.name} Speed: ${state.speed}`);

        this.service.updateCharacteristic(
            this.homebridge.hap.Characteristic.On,
            state.state === "On" || state.state === "Auto",
        );

        this.service.updateCharacteristic(this.homebridge.hap.Characteristic.RotationSpeed, speed);

        if (this.device.capabilities.auto) {
            this.log.debug(`Fan: ${this.device.name} Auto: ${state.state === "Auto" ? "On" : "Off"}`);

            this.auto?.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.state === "Auto");
        }

        if (this.device.capabilities.whoosh) {
            this.log.debug(`Fan: ${this.device.name} Whoosh: ${state.whoosh}`);

            this.whoosh?.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.whoosh === "On");
        }

        if (this.device.capabilities.eco) {
            this.log.debug(`Fan: ${this.device.name} Eco: ${state.eco || "Off"}`);

            this.eco?.updateCharacteristic(this.homebridge.hap.Characteristic.On, state.eco === "On");
        }
    }

    /**
     * Fetches the current state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetState = (): CharacteristicValue => {
        this.log.debug(`Fan Get State: ${this.device.name} ${this.device.status.state}`);

        return this.device.status.state === "On";
    };

    /**
     * Fetches the current speed when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetSpeed = (): CharacteristicValue => {
        const speed = Math.round((this.device.status.speed / 7) * 100);

        this.log.debug(`Fan Get Speed: ${this.device.name} ${this.device.status.speed}`);

        return speed;
    };

    /**
     * Updates the device speed when a change comes in from Homebridge.
     */
    private onSetSpeed = async (value: CharacteristicValue): Promise<void> => {
        const speed = Math.round((((value as number) || 0) / 100) * 7);
        const state = speed > 0 ? "On" : "Off";

        if (this.device.status.state !== state || this.device.status.speed !== speed) {
            this.log.debug(`Fan Set State: ${this.device.name} ${state}`);
            this.log.debug(`Fan Set Speed: ${this.device.name} ${speed}`);

            await this.device.set({
                state,
                speed,
                whoosh: this.device.status.whoosh,
                eco: this.device.status.eco || "Off",
            });
        }
    };

    /**
     * Fetches the current auto state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetAuto = (): CharacteristicValue => {
        this.log.debug(`Fan Get Auto: ${this.device.name} ${this.device.status.state === "Auto" ? "On" : "Off"}`);

        return this.device.status.state === "Auto";
    };

    /**
     * Updates the device auto state when a change comes in from Homebridge.
     */
    private onSetAuto = async (value: CharacteristicValue): Promise<void> => {
        const state = value ? "Auto" : "Off";

        if (this.device.status.state !== state) {
            this.log.debug(`Fan Set State: ${this.device.name} ${state}`);

            await this.device.set({
                state,
                speed: this.device.status.speed,
                whoosh: this.device.status.whoosh,
                eco: this.device.status.eco || "Off",
            });
        }
    };

    /**
     * Fetches the current whoosh state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetWhoosh = (): CharacteristicValue => {
        this.log.debug(`Fan Get Whoosh: ${this.device.name} ${this.device.status.whoosh}`);

        return this.device.status.whoosh === "On";
    };

    /**
     * Updates the device whoosh state when a change comes in from Homebridge.
     */
    private onSetWhoosh = async (value: CharacteristicValue): Promise<void> => {
        const whoosh = value ? "On" : "Off";

        if (this.device.status.whoosh !== whoosh) {
            this.log.debug(`Fan Set Whoosh: ${this.device.name} ${whoosh}`);

            await this.device.set({
                state: this.device.status.state as "On" | "Off" | "Auto",
                speed: this.device.status.speed,
                whoosh,
                eco: this.device.status.eco || "Off",
            });
        }
    };

    /**
     * Fetches the current eco state when Homebridge asks for it.
     *
     * @returns A characteristic value.
     */
    private onGetEco = (): CharacteristicValue => {
        this.log.debug(`Fan Get Eco: ${this.device.name} ${this.device.status.eco || "Off"}`);

        return this.device.status.eco === "On";
    };

    /**
     * Updates the device eco state when a change comes in from Homebridge.
     */
    private onSetEco = async (value: CharacteristicValue): Promise<void> => {
        const eco = value ? "On" : "Off";

        if (this.device.status.eco !== eco) {
            this.log.debug(`Fan Set Eco: ${this.device.name} ${eco}`);

            await this.device.set({
                state: this.device.status.state as "On" | "Off" | "Auto",
                speed: this.device.status.speed,
                whoosh: this.device.status.whoosh,
                eco,
            });
        }
    };
}
