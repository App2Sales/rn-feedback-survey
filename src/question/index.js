import React, { Component } from 'react';
import { Text, View, Linking, Image, Platform, AsyncStorage, TouchableOpacity, TextInput } from 'react-native';
import { CheckBox } from 'react-native-elements';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import moment from 'moment';
import deviceInfo from '../deviceInfo';
import icons from '../../config/icons';
import styles from './styles';

const APPLENATIVE_PREFIX = 'itms-apps://itunes.apple.com/app/id';
const GOOGLE_PREFIX = 'http://play.google.com/store/apps/details?id=';

class Question extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      response: null,
      rating: 0,
      questionVisibile: false,
      user: {
        user: props.userInfo ? props.userInfo : null,
        deviceInfo
      },
      survey: null,
      question: null,
      sendStoreConfirmationVisible: false
    };
  }

  componentWillMount() {
    const { survey } = this.props;  
    AsyncStorage.getItem('@app2sales-feedback-survey').then((value) => {
      if (survey) {
        const localQuestions = JSON.parse(value);
        if (localQuestions === undefined || localQuestions === null) {
          /* If not exists this tag on AsyncStorage, create a new */
          AsyncStorage.setItem(
            '@app2sales-feedback-survey',
            JSON.stringify({
              survey,
              questionMap: this.getPreparedQuestions(survey.questions),
              lastFetch: new Date().getTime(),
              lastAppearance: new Date().getTime()
            })
          );
        } else {
          const question = this.getAppearQuestion(localQuestions, 2);
          if (question !== undefined) {
            this.setState({
              visible: true,
              questionVisibile: true,
              question,
              survey
            });
          } else {
            this.setState({ visible: false });
          }
          AsyncStorage.setItem(
            '@app2sales-feedback-survey',
            JSON.stringify(localQuestions)
          );
        }
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { survey } = nextProps;  
    AsyncStorage.getItem('@app2sales-feedback-survey').then((value) => {
      if (survey) {
        const localQuestions = JSON.parse(value);
        if (localQuestions === undefined || localQuestions === null) {
          /* If not exists this tag on AsyncStorage, create a new */
          AsyncStorage.setItem(
            '@app2sales-feedback-survey',
            JSON.stringify({
              survey,
              questionMap: this.getPreparedQuestions(survey.questions),
              lastFetch: new Date().getTime(),
              lastAppearance: new Date().getTime()
            })
          );
        } else {
          const question = this.getAppearQuestion(localQuestions, 2);
          if (question !== undefined) {
            this.setState({
              visible: true,
              questionVisibile: true,
              question,
              survey
            });
          } else {
            this.setState({ visible: false });
          }
          AsyncStorage.setItem(
            '@app2sales-feedback-survey',
            JSON.stringify(localQuestions)
          );
        }
      }
    });
  }

  onPressCheckBox = (response) => {
    const newQuestionWithAlternatives = this.state.question;
    newQuestionWithAlternatives.question.alternatives = this.handleCheckAlternatives(response);
    this.setState({
      response,
      question: newQuestionWithAlternatives
    });
  }
  onchangeTextQuestion = response => this.setState({ response });

  getComponentRatingQuestion = () => {
    const { question } = this.state;

    return (
      <View style={styles.whiteBoxContainer}>
        <Text style={styles.title}>{this.props.title}</Text>
        <Text style={styles.question}>{question.question.title}</Text>
        <View style={styles.alternativesEvaluationContainer}>
          {this.renderRatingAlternatives()}
        </View>
        {this.renderButtons(this.closeModal, this.ratingSubmitAction)}
      </View>
    );
  }

  getComponentTextQuestion = () => {
    const {
      question,
      response,
      user,
      survey
    } = this.state;
    const { onQuestionAnswered } = this.props;
    const textQuestionInputViewStyle = { ...styles.alternativesContainer, padding: 10 };
    return (
      <View style={styles.whiteBoxContainer}>
        <Text style={styles.title}>{this.props.title}</Text>
        <Text style={styles.question}>{this.state.question.question.title}</Text>
        <View style={textQuestionInputViewStyle}>
          <TextInput
            multiline
            onChangeText={this.onchangeTextQuestion}
            style={styles.textIpuntQuestion}
          />
        </View>
        {this.renderButtons(
          this.closeModal,
          () => {
            this.markQuestionAsAnswered();
            onQuestionAnswered({
              question,
              response,
              user,
              survey
            });
            this.closeModal();
          }
        )}
      </View>);
  };


  getComponentMultipleChoiceQuestion = () => {
    const {
      question,
      response,
      user,
      survey
    } = this.state;
    const { onQuestionAnswered } = this.props;
    return (
      <View style={styles.whiteBoxContainer}>
        <Text style={styles.title}>{this.props.title}</Text>
        <Text style={styles.question}>{this.state.question.question.title}</Text>
        <View style={styles.alternativesContainer}>
          {question.question.alternatives.map(item => (
            <CheckBox
              key={item.index}
              title={item.text}
              onPress={() => this.onPressCheckBox(item)}
              checkedIcon={'dot-circle-o'}
              uncheckedIcon={'circle-o'}
              checked={item.checked}
              containerStyle={styles.alternativeView}
              textStyle={styles.alternativeText} />
          ))}
        </View>
        {this.renderButtons(
          this.closeModal,
          () => {
            this.markQuestionAsAnswered();
            onQuestionAnswered({
              question,
              response,
              user,
              survey
            });
            this.closeModal();
          }
        )}
      </View>);
  };

  getPreparedQuestions(questions) {
    if (questions.length > 0) {
      const preparedQuestion = [];
      questions.forEach((item, index) => {
        const question = item;
        if (item.type === 'multiple-choice' || item.type === 'rating') {
          if (typeof question.alternatives[0] !== 'object') {
            question.alternatives =
              item.alternatives.map((value, i) =>
                ({ index: i, text: value, checked: false }));
          }
        }
        preparedQuestion.push({ index, question, answered: false });
      });
      return preparedQuestion;
    }
    return [];
  }

  getAppearQuestion = (localQuestions, delay) => localQuestions.questionMap.find((item) => {
    // NEED TO CHANGE time stamp on diff to "survey.delay"
    const diff = moment(localQuestions.lastAppearance).diff(1518307200, 'days');
    return diff >= delay && !item.answered;
  });

  getEmoji(item) {
    switch (item.text) {
      case 1:
        return icons.emojiAngry;
      case 2:
        return icons.emojiSad;
      case 3:
        return icons.emojiThinking;
      case 4:
        return icons.emojiHappy;
      case 5:
        return icons.emojiLove;
      default:
        return null;
    }
  }

  markQuestionAsAnswered = () => {
    AsyncStorage.getItem('@app2sales-feedback-survey').then((value) => {
      const localQuestions = JSON.parse(value);
      localQuestions.questionMap = localQuestions.questionMap.map((item) => {
        const newItem = {};
        Object.assign(newItem, item);
        if (item.question.key === this.state.question.question.key) {
          newItem.answered = true;
        }
        return newItem;
      });
      AsyncStorage.setItem(
        '@app2sales-feedback-survey',
        JSON.stringify(localQuestions)
      );
    });
  }

  ratingSubmitAction = () => {
    const {
      response,
      user,
      question,
      survey
    } = this.state;
    const { onQuestionAnswered } = this.props;
    this.markQuestionAsAnswered();
    onQuestionAnswered({
      question,
      response,
      user,
      survey
    });
    if ((question.type !== 'rating') && (response >= 4)) {
      this.setState({ sendStoreConfirmationVisible: true, questionVisibile: false });
    } else {
      this.closeModal();
    }
  }

  sendToStore = () => {
    const storeBaseUrl = Platform.OS === 'android' ? GOOGLE_PREFIX : APPLENATIVE_PREFIX;
    const completeUrl = `${storeBaseUrl}${deviceInfo.bundleId}`;
    Linking.canOpenURL(completeUrl).then((supported) => {
      if (supported) {
        Linking.openURL(completeUrl);
      }
    });
  }


  needUpdate(remote, localy) {
    /* NEED TO FIX THIS, IS BETTER TO USE ANY ID OF RESEARCh INSTEAD OF CHECK THE IDS OF QUESTION */
    const localyIds = localy.questionMap.map(item => item.id);
    const remoteIds = remote.map(item => item.id);
    return JSON.stringify(localyIds.sort((a, b) => a > b)) !==
      JSON.stringify(remoteIds.sort((a, b) => a > b));
  }

  handleCheckAlternatives = result => this.state.question.question.alternatives.map(item => ({
    ...item,
    checked: (result.index === item.index)
  }));

  handleMarkStars = amount => this.setState({ rating: amount, response: amount })

  closeModal = () => this.setState({ visible: false });

  renderStars = () => {
    const stars = [1, 2, 3, 4, 5].map((num) => {
      const starStyle = {
        ...styles.stars,
        tintColor: this.state.rating >= num ? '#FFE04B' : '#595959'
      };

      return (
        <TouchableOpacity
          key={num}
          onPress={() => this.handleMarkStars(num)}
          style={styles.touchableEvaluationAlternative}>
          <Image
            source={icons.star}
            style={starStyle} />
        </TouchableOpacity>
      );
    });
    return <View style={styles.starContainer}>{stars}</View>;
  }

  renderEmojis = (item) => {
    const imgStyle = item.checked ?
      { ...styles.imgEvaluationAlternative, width: 43, height: 43 } :
      { ...styles.imgEvaluationAlternative, width: 30, height: 30 };
    return (
      <TouchableOpacity
        key={item.index}
        onPress={() => this.onPressCheckBox(item)}
        style={styles.touchableEvaluationAlternative}>
        <Image
          style={imgStyle}
          source={this.getEmoji(item)} />
      </TouchableOpacity>
    );
  }

  renderRatingAlternatives = () => {
    const { question } = this.state;
    if (question.question.ratingType !== undefined && question.question.ratingType === 'emoji') {
      return question.question.alternatives.map(item => this.renderEmojis(item));
    }
    return this.renderStars();
  }

  renderButtons = (onCancel, onSubmit) => {
    const sendTextStyle = this.state.response !== null ?
      { ...styles.submitBtnText, color: '#40c3e8' } :
      { ...styles.submitBtnText, color: '#999' };
    return (
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cancelBtnTouch}
          onPress={onCancel}>
          <Text style={styles.cancelBtnText}>CANCELAR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={this.state.response === null}
          style={styles.SubmitBtnTouch}
          onPress={onSubmit}>
          <Text style={sendTextStyle}>ENVIAR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  renderSendStoreConfirmation = () => {
    const sendTextStyle = { ...styles.submitBtnText, color: '#40c3e8' };

    return (
      <View style={styles.whiteBoxContainer}>
        <Image source={icons.especialStar} style={styles.imgSendStore} />
        <Text style={styles.sendStoreTitle}>
          Olá, nos avalie também na loja, clique no botão abaixo,
          não levará mais que 1 minuto. Muito obrigado!
        </Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.cancelBtnTouch}
            onPress={this.closeModal}>
            <Text style={styles.cancelBtnText}>CANCELAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.SubmitBtnTouch}
            onPress={() => { this.closeModal(); this.sendToStore(); }}>
            <Text style={sendTextStyle}>IR A LOJA</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  renderContent = () => {
    const { question, sendStoreConfirmationVisible, questionVisibile } = this.state;

    if (sendStoreConfirmationVisible) {
      return this.renderSendStoreConfirmation();
    }

    if (question !== null && questionVisibile) {
      switch (question.question.type) {
        case 'multiple-choice':
          return this.getComponentMultipleChoiceQuestion();
        case 'text':
          return this.getComponentTextQuestion();
        case 'rating':
          return this.getComponentRatingQuestion();
        default:
          return <View />;
      }
    }
    return <View />;
  }

  render() {
    return (
      <Modal
        animationIn={'fadeIn'}
        isVisible={this.state.visible}
        style={styles.modal}>
        {this.renderContent()}
      </Modal>
    );
  }
}

Question.propTypes = {
  /* Prop used to render samples of messages
    * to make more easy the call on the father class!! */
  title: PropTypes.string,
  onQuestionAnswered: PropTypes.func.isRequired,
  survey: PropTypes.object.isRequired,
  userInfo: PropTypes.object
};

Question.defaultProps = {
  title: 'Que tal nos dar um feedback?'
};

export default Question;
