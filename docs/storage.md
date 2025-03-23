# Storage

This documents what files get wrote to your device and what each file does.

## Storage Directory

This plugin stores files to a `.baf` folder in the same directory as `.homebridge`.

## Files

Each file stores different information related to your Big Ass Fans.

### Discovery

The `discovery` file stores information about the Big Ass Fans found on your network. This is used to speed up startup and can attempt to connect to previously discovered devices, while mDNS is waiting for a broadcast.

If any network information changes on the device, this will be re-discovered and updated via mDNS.

## Homebridge Configuration

There also is a configuration section for this plugin in the Homebridge `config.json` file. This contains information related to the Homebridge instance.

This contains which device types are exposed and the nesessary properties for Homebridge.
