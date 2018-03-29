import { AsyncStorage } from 'react-native';

class Questions {
  constructor(baseUrl, project) {
    this.baseUrl = baseUrl;
    this.project = project;
  }

  onQuestionAnswered = (data, callback) => {
    const {
      question,
      response,
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
    }).then(resp => resp.json()).then((resp) => {
      if (resp.success) {
        const sendData = {
          project: this.project,
          surveyKey: survey.survey.key,
          questionKey: question.question.key,
          userResponse: response,
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
            callback();
          }
        }).catch(() => { });
      }
    }).catch(() => { });
  };


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
        /* tratar a fila de persistencia caso n haja net -> 
        AsyncStorage.getItem('@app2sales-feedback-survey').then((data) => { }); */
        AsyncStorage.removeItem('@app2sales-feedback-survey');
      }
    })
    .catch(error => console.log(error));
}

export default Questions;
