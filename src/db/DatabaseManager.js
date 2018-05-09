import { AsyncStorage } from 'react-native';

class DbManager {
  static read = callback =>
    AsyncStorage
      .getItem('@app2sales-feedback-survey')
      .then(callback);

  static save = (data) => {
    AsyncStorage.removeItem('@app2sales-feedback-survey');
    AsyncStorage.setItem(
      '@app2sales-feedback-survey',
      JSON.stringify(data)
    );
  }

  static clearAll = () => AsyncStorage.removeItem('@app2sales-feedback-survey');
}

export default DbManager;
