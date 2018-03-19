import DeviceInfo from 'react-native-device-info';

const deviceInfo = {
  bundleId: DeviceInfo.getBundleId(),
  uniqueID: DeviceInfo.getUniqueID(),
  Manufacturer: DeviceInfo.getManufacturer(),
  brand: DeviceInfo.getBrand(),
  model: DeviceInfo.getModel(),
  deviceID: DeviceInfo.getDeviceId(),
  systemName: DeviceInfo.getSystemName(),
  systemVersion: DeviceInfo.getSystemVersion(),
  buildNumber: DeviceInfo.getBuildNumber(),
  appVersion: DeviceInfo.getVersion(),
  versionName: DeviceInfo.getReadableVersion(),
  deviceName: DeviceInfo.getDeviceName(),
  isEmulator: DeviceInfo.isEmulator(),
  isTablet: DeviceInfo.isTablet()
};

export default deviceInfo;
