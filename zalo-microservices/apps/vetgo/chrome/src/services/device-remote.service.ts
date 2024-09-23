import {BasePatternSheet} from "../google-sheet/base-pattern.sheet";
import {DeviceRemoteModel} from "../models/device-remote.model";

export class DeviceRemoteService extends  BasePatternSheet<DeviceRemoteModel> {
   constructor() {
     super("DEVICE_REMOTE")
    // not call any method here
  }

  stringify(data: DeviceRemoteModel): DeviceRemoteModel {
    return new DeviceRemoteModel(data);
  }
  toData(data: DeviceRemoteModel): DeviceRemoteModel {
    return new DeviceRemoteModel(data);
  }

}
