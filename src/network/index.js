import { NetInfo } from 'react-native';
import Reactotron from 'reactotron-react-native';

class NetworkHandle {
  static doIfConnected = (successCallback, failCallback) =>
    NetInfo.isConnected
      .fetch()
      .then((isConnected) => {
        Reactotron.log('DOIFCONNECTED');
        Reactotron.log(isConnected);
        if (isConnected) {
          successCallback();
        } else {
          failCallback();
        }
      });
}

export default NetworkHandle;
