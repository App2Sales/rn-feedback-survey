import { NetInfo } from 'react-native';

class NetworkHandle {
  static doIfConnected = (successCallback, failCallback) =>
    NetInfo.isConnected
      .fetch()
      .then((isConnected) => {
        if (isConnected) {
          successCallback();
        } else {
          failCallback();
        }
      });
}

export default NetworkHandle;
