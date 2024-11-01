import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";
import { Temperature } from "../src/Temperature";

chai.use(sinonChai);

describe("Temperature", () => {
    let homebridgeStub: any;
    let serviceStub: any;
    let deviceStub: any;
    let hapStub: any;
    let logStub: any;

    let stateStub: any;
    let accessoryStub: any;

    let temperature: Temperature;

    beforeEach(() => {
        logStub = {
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
            debug: sinon.stub(),
        };

        hapStub = {
            uuid: {
                generate: sinon.stub().returns("UUID_ACCESSORIES"),
            },
            Service: {
                AccessoryInformation: "AccessoryInformation",
                TemperatureSensor: "TemperatureSensor",
            },
            Characteristic: {
                Model: "Model",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
                CurrentTemperature: "CurrentTemperature",
            },
        };

        stateStub = {
            callbacks: {},

            onGet(callback: Function) {
                this.callbacks["Get"] = callback;

                return this;
            },
        };

        accessoryStub = {
            setCharacteristic: sinon.stub(),
            getCharacteristic: sinon.stub(),
            updateCharacteristic: sinon.stub(),
        };

        accessoryStub.setCharacteristic.returns(accessoryStub);
        accessoryStub.getCharacteristic.withArgs("CurrentTemperature").returns(stateStub);
        serviceStub = sinon.stub();

        homebridgeStub = {
            callbacks: {},

            hap: hapStub,
            on: sinon.stub(),
            registerPlatformAccessories: sinon.stub(),
            unregisterPlatformAccessories: sinon.stub(),

            platformAccessory: class {
                getService: any = serviceStub;
                addService: any = sinon.stub().returns(accessoryStub);
            },
        };

        deviceStub = {
            id: "ID_TEMPERATURE",
            name: "NAME",
            type: DeviceType.Temperature,
            status: { state: "Auto", temprature: 20 },
            update: sinon.stub(),
            set: sinon.stub(),
            capabilities: {},
        };
    });

    it("should bind listeners when device is created", () => {
        serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        serviceStub.withArgs("TemperatureSensor").returns(undefined);

        temperature = new Temperature(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;
    });

    it("should bind listeners when device is created from cache", () => {
        serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        serviceStub.withArgs("TemperatureSensor").returns(accessoryStub);

        temperature = new Temperature(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;
    });

    describe("onUpdate()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("TemperatureSensor").returns(accessoryStub);

            temperature = new Temperature(homebridgeStub, deviceStub, logStub);
        });

        it("should update the temperature", () => {
            temperature.onUpdate({ state: "Auto", temprature: 30 });

            expect(accessoryStub.updateCharacteristic).to.be.calledWith("CurrentTemperature", 30);
        });
    });

    describe("onGetState()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("TemperatureSensor").returns(accessoryStub);

            temperature = new Temperature(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current temperature of the device", () => {
            expect(stateStub.callbacks["Get"]()).to.equal(20);
        });

        it("should return the current temperature after an update", () => {
            deviceStub.status = { state: "Auto", temprature: 30 };

            expect(stateStub.callbacks["Get"]()).to.equal(30);
        });
    });
});
