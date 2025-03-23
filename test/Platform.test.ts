import proxyquire from "proxyquire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";
import { Platform } from "../src/Platform";

chai.use(sinonChai);

describe("Platform", () => {
    let homebridgeStub: any;
    let connectionStub: any;
    let configStub: any;
    let deviceStub: any;
    let hapStub: any;
    let logStub: any;

    let characteristicStub: any;
    let accessoryStub: any;

    let platform: Platform;
    let platformType: typeof Platform;

    const emit = (stub: any, event: string, ...payload: any[]) => {
        for (const callback of stub.callbacks[event] || []) {
            callback(...payload);
        }
    };

    before(() => {
        platformType = proxyquire("../src/Platform", {
            "@mkellsy/baf-client": {
                connect() {
                    return {
                        on(event: string, callback: Function) {
                            if (connectionStub.callbacks[event] == null) {
                                connectionStub.callbacks[event] = [];
                            }

                            connectionStub.callbacks[event].push(callback);

                            return this;
                        },
                    };
                },
            },
        }).Platform;
    });

    beforeEach(() => {
        connectionStub = { callbacks: {} };

        logStub = {
            info: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
            debug: sinon.stub(),
        };

        hapStub = {
            uuid: {
                generate: sinon.stub().returns("UUID_PLATFORM"),
            },
            Service: {
                AccessoryInformation: "AccessoryInformation",
            },
            Characteristic: {
                Model: "Model",
                Manufacturer: "Manufacturer",
                SerialNumber: "SerialNumber",
            },
        };

        characteristicStub = {
            callbacks: {},

            onGet(callback: Function) {
                this.callbacks["Get"] = [callback];

                return this;
            },

            onSet(callback: Function) {
                this.callbacks["Set"] = [callback];

                return this;
            },
        };

        accessoryStub = {
            addCharacteristic: sinon.stub(),
            setCharacteristic: sinon.stub().returns(accessoryStub),
            getCharacteristic: sinon.stub().returns(characteristicStub),
            updateCharacteristic: sinon.stub(),
        };

        homebridgeStub = {
            callbacks: {},

            hap: hapStub,
            registerPlatformAccessories: sinon.stub(),
            unregisterPlatformAccessories: sinon.stub(),

            platformAccessory: class {
                getService: any = () => accessoryStub;
            },

            on(event: string, callback: Function) {
                if (this.callbacks[event] == null) {
                    this.callbacks[event] = [];
                }

                this.callbacks[event].push(callback);

                return this;
            },
        };

        configStub = {
            name: "Haiku",
            platform: "Haiku",
        };

        deviceStub = {
            id: "ID",
            type: DeviceType.Dimmer,
            update: sinon.stub(),
            set: sinon.stub(),
        };

        platform = new platformType(logStub, configStub, homebridgeStub);
    });

    it("should define the finish launching event", () => {
        expect(homebridgeStub.callbacks["didFinishLaunching"]).to.not.be.undefined;
    });

    it("should bind events after launching", () => {
        emit(homebridgeStub, "didFinishLaunching");

        expect(connectionStub.callbacks["Available"]).to.not.be.undefined;
        expect(connectionStub.callbacks["Update"]).to.not.be.undefined;
    });

    describe("onAvailable()", () => {
        beforeEach(() => {
            emit(homebridgeStub, "didFinishLaunching");
        });

        it("should create a device and register to homebridge", () => {
            emit(connectionStub, "Available", [deviceStub]);

            expect(homebridgeStub.registerPlatformAccessories).to.be.calledWith(
                "@mkellsy/homebridge-haiku",
                "Haiku",
                sinon.match.any,
            );
        });

        it("should unregister an undefined device from homebridge", () => {
            deviceStub.type = DeviceType.Unknown;

            emit(connectionStub, "Available", [deviceStub]);

            expect(homebridgeStub.unregisterPlatformAccessories).to.be.calledWith(
                "@mkellsy/homebridge-haiku",
                "Haiku",
                sinon.match.any,
            );
        });

        it("should not register an undefined device", () => {
            deviceStub.type = DeviceType.Unknown;

            emit(connectionStub, "Available", [deviceStub]);
            expect(homebridgeStub.registerPlatformAccessories).to.not.be.called;
        });

        it("should not register a cached device", () => {
            platform.configureAccessory(new homebridgeStub.platformAccessory());

            emit(connectionStub, "Available", [deviceStub]);

            expect(homebridgeStub.registerPlatformAccessories).to.not.be.called;
            expect(homebridgeStub.unregisterPlatformAccessories).to.not.be.called;
        });
    });

    describe("onUpdate()", () => {
        beforeEach(() => {
            emit(homebridgeStub, "didFinishLaunching");
        });

        it("should call update characteristic when an update event is recieved", () => {
            emit(connectionStub, "Available", [deviceStub]);
            emit(connectionStub, "Update", deviceStub, { state: "Off", level: 0 });

            expect(accessoryStub.updateCharacteristic).to.be.called;
        });

        it("should not call update characteristic for unregistered devices", () => {
            hapStub.uuid.generate.returns("UUID_PLATFORM_2");

            emit(connectionStub, "Update", deviceStub, { state: "Off", level: 0 });
            expect(accessoryStub.updateCharacteristic).to.not.be.called;
        });
    });
});
