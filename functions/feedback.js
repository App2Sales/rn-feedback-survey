import { Platform, Linking, NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { create } from 'apisauce';

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

const APPLENATIVE_PREFIX = 'itms-apps://itunes.apple.com/app/id';
const GOOGLE_PREFIX = 'http://play.google.com/store/apps/details?id=';

class Feedback {
  constructor() {
    this.project = '';
    this.projectRef = null;
    this.api = null;
  }

  setProject(project, baseUrl) {
    this.project = project;
    this.baseURL = baseUrl;
    this.api = create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

    getChangeLog = () =>
      this.api.get(`/changeLog?project=${this.project}`)
        .then((response) => {
          if (response.ok) {
            return response.data;
          }
          return [];
        });

    getSubjects = () =>
      this.api.get(`/subjects?project=${this.project}`)
        .then((response) => {
          if (response.ok) {
            return response.data;
          }
          return [];
        });

    getFeedbackEnabled = () =>
      this.api.get(`/feedbackEnabled?project=${this.project}`)
        .then((response) => {
          if (response.ok) {
            return response.data;
          }
          return [];
        });

    postFeedback(subject, comment, rating, additionalData = null, print = null) {
      const data = {
        subject,
        comment,
        rating,
        additionalData,
        deviceInfo,
        project: this.project
      };
      return this.api.post('/feedback', data);
    }

  /* ### blocos de código para as funções de questionário ### */

    getQuestions = () =>
      this.api.post('/questions', { project: this.project })
        .then((response) => {
          if (response.ok) {
            return response.data;
          }
          return [];
        });

    postQuestion = (question, response, user = null, additionalData = null) => {
      const data = {
        question,
        response,
        user,
        additionalData,
        deviceInfo,
        project: this.project
      };
      return this.api.post('/responsequestions', data);
    }
  /* ### blocos de código para as funções de questionário ### */

  sendToStore = () => {
    const storeBaseUrl = Platform.OS === 'android' ? GOOGLE_PREFIX : APPLENATIVE_PREFIX;
    const completeUrl = `${storeBaseUrl}${deviceInfo.bundleId}`;
    Linking.canOpenURL(completeUrl).then((supported) => {
      if (supported) {
        Linking.openURL(completeUrl);
      }
    });
  }
}

export default new Feedback();
