import { AsyncStorage } from 'react-native';

import NetworkHandle from '../network';


class Questions {
  constructor(baseUrl, project) {
    this.baseUrl = baseUrl;
    this.project = project;
  }

  onQuestionAnswered = (data, callback) =>
    NetworkHandle.doIfConnected(
      () => this.answerCallbackSuccess(data, callback),
      () => this.answerCallbackFail(data, callback)
    );

  answerCallbackSuccess = (data, callback = null) => {
    const {
      question,
      responseData,
      user,
      survey
    } = data;
    fetch(`${this.baseUrl}/addUser`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project: this.project,
        user
      })
    }).then(resp => resp.json())
      .then((resp) => {
        if (resp.success) {
          const sendData = {
            ...responseData,
            project: this.project,
            surveyKey: survey.key,
            questionKey: question.question.key,
            userKey: resp.userKey
          };
          fetch(`${this.baseUrl}/responseQuestion`, {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendData)
          }).then((responseJson) => {
            if (responseJson.ok) {
              if (callback) {
                callback();
              }
            }
          }).catch(() => { });
        }
      }).catch(() => { });
  }

  answerCallbackFail = (data, callback) => {
    AsyncStorage
      .setItem(
        '@app2sales-queue-persist-answers',
        JSON.stringify(data)
      ).then(() => {
        callback();
      });
  };

  persistAnsweredsWithouNetwork = () => {
    AsyncStorage.getItem('@app2sales-queue-persist-answers')
      .then((value) => {
        const dataSaved = JSON.parse(value);
        if (dataSaved !== null) {
          this.answerCallbackSuccess(dataSaved);
          AsyncStorage.removeItem('@app2sales-queue-persist-answers');
        }
      });
  }

  configSurvey = callback => fetch(`${this.baseUrl}/getsurvey`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ project: this.project })
  }).then(response => response.json())
    .then((json) => {
      if (json.haveEnableSurvey) {
        callback(json.data);
      } else {
        AsyncStorage.removeItem('@app2sales-queue-persist-answers');
        AsyncStorage.removeItem('@app2sales-feedback-survey');
      }
    })
    .catch(error => console.log(error));
}

export default Questions;
