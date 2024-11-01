import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";
import { Humidity } from "../src/Humidity";

chai.use(sinonChai);

describe("Humidity", () => {
    let homebridgeStub: any;
    let serviceStub: any;
    let deviceStub: any;
    let hapStub: any;
    let logStub: any;

    let stateStub: any;
    let accessoryStub: any;

    let humidity: Humidity;

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
                HumiditySensor: "HumiditySensor",
            },
            Characteristic: {
                Model: "Model",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
                CurrentRelativeHumidity: "CurrentRelativeHumidity",
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
        accessoryStub.getCharacteristic.withArgs("CurrentRelativeHumidity").returns(stateStub);
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
            id: "ID_HUMIDITY",
            name: "NAME",
            type: DeviceType.Humidity,
            status: { state: "Auto", humidity: 40 },
            update: sinon.stub(),
            set: sinon.stub(),
            capabilities: {},
        };
    });

    it("should bind listeners when device is created", () => {
        serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);

        humidity = new Humidity(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;
    });

    it("should bind listeners when device is created from cache", () => {
        serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
        serviceStub.withArgs("HumiditySensor").returns(accessoryStub);

        humidity = new Humidity(homebridgeStub, deviceStub, logStub);

        expect(stateStub.callbacks["Get"]).to.not.be.undefined;
    });

    describe("onUpdate()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("HumiditySensor").returns(accessoryStub);

            humidity = new Humidity(homebridgeStub, deviceStub, logStub);
        });

        it("should update the humidity", () => {
            humidity.onUpdate({ state: "Auto", humidity: 40 });

            expect(accessoryStub.updateCharacteristic).to.be.calledWith("CurrentRelativeHumidity", 40);
        });
    });

    describe("onGetState()", () => {
        beforeEach(() => {
            serviceStub.withArgs("AccessoryInformation").returns(accessoryStub);
            serviceStub.withArgs("HumiditySensor").returns(accessoryStub);

            humidity = new Humidity(homebridgeStub, deviceStub, logStub);
        });

        it("should return the current humidity of the device", () => {
            expect(stateStub.callbacks["Get"]()).to.equal(40);
        });

        it("should return the current humidity after an update", () => {
            deviceStub.status = { state: "Auto", humidity: 30 };

            expect(stateStub.callbacks["Get"]()).to.equal(30);
        });
    });
});
