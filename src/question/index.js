import React, { Component } from 'react';
import { Text, View, Image, AsyncStorage, TouchableOpacity } from 'react-native';
import { CheckBox } from 'react-native-elements';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import moment from 'moment';
import icons from '../../config/icons';
import feedback from '../../functions/feedback';
import styles from './styles';

class Question extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      response: null,
      rating: 0,
      questionVisibile: true,
      question: null,
      sendStoreConfirmationVisible: false
    };
    feedback.setProject(this.props.project, this.props.baseUrl);
  }

  componentWillMount() {
    this.willMountQuestions();
  }

  // NEED TO MAKE THE LOGIC FOR USE CHECKBOXES LIKE A RADIOBUTTON
  onPressCheckBox = (response) => {
    const newQuestionWithAlternatives = this.state.question;
    newQuestionWithAlternatives.question.alternatives = this.handleCheckAlternatives(response);
    this.setState({
      response,
      question: newQuestionWithAlternatives
    });
  }

  getComponentEvaluationApp = () => {
    const { question } = this.state;
    return (
      <View style={styles.whiteBoxContainer}>
        <Text style={styles.title}>{this.props.title}</Text>
        <Text style={styles.question}>{question.question.title}</Text>
        <View style={styles.alternativesEvaluationContainer}>
          {this.renderEvaluationAlternatives()}
        </View>
        {this.renderButtons(
          this.closeModal,
          () => this.sendReport(this.state.question, { rating: this.state.rating })
        )}
      </View>
    );
  }

  getComponentMultipleChoice = () => (
    <View style={styles.whiteBoxContainer}>
      <Text style={styles.title}>{this.props.title}</Text>
      <Text style={styles.question}>{this.state.question.question.title}</Text>
      <View style={styles.alternativesContainer}>
        {this.state.question.question.alternatives.map(item => (
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
        () => this.sendReport(this.state.question, this.state.response)
      )}
    </View>);

  getPreparedQuestions(questions) {
    if (questions.length > 0) {
      const preparedQuestion = [];
      questions.forEach((item, index) => {
        const question = item;
        question.alternatives = item.alternatives.map((value, i) =>
          ({ index: i, text: value, checked: false }));
        preparedQuestion.push({ index, question, answered: false });
      });
      return preparedQuestion;
    }
    return [];
  }

  getAppearQuestion = localQuestions => localQuestions.questionMap.find((item) => {
    // NEED TO CHANGE time stamp on diff to "new Date().getTime()"
    const diff = moment(localQuestions.lastAppearance).diff(1518307200, 'days');
    return diff >= item.question.delay && !item.answered;
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

  willMountQuestions = () => {
    /*
      Teremos que mudar aqui para ajustar quando o painel estiver pronto e a estrutura tbm.
      Lembrar de mudar a estrutura de receber, salvar no banco e mostrar.
    */
    /* Get questions from firebase endpoint */
    feedback.getQuestions().then((serverQuestions) => {
      /* Handle data localy */
      AsyncStorage.getItem('@app2sales-feedback-questions').then((value) => {
        const localQuestions = JSON.parse(value);
        if (localQuestions === undefined || localQuestions === null) {
          /* If not exists this tag on AsyncStorage, create a new */
          AsyncStorage.setItem(
            '@app2sales-feedback-questions',
            JSON.stringify({
              questionMap: this.getPreparedQuestions(serverQuestions),
              lastFetch: new Date().getTime(),
              lastAppearance: new Date().getTime()
            })
          );
        } else {
          // if (this.needUpdate(serverQuestions, localQuestions)) {
          //   localQuestions.questionMap = this.getPreparedQuestions(serverQuestions);
          //   localQuestions.lastFetch = new Date().getTime();
          // }

          const question = this.getAppearQuestion(localQuestions);
          if (question !== undefined) {
            this.setState({ visible: true, questionVisibile: true, question });
          } else {
            this.setState({ visible: false });
          }
          AsyncStorage.setItem(
            '@app2sales-feedback-questions',
            JSON.stringify(localQuestions)
          );
        }
      });
    });
  }

  needUpdate(remote, localy) {
    /* NEED TO FIX THIS, IS BETTER TO USE ANY ID OF RESEARCh INSTEAD OF CHECK THE IDS OF QUESTION */
    const localyIds = localy.questionMap.map(item => item.id);
    const remoteIds = remote.map(item => item.id);
    return JSON.stringify(localyIds.sort((a, b) => a > b)) !==
      JSON.stringify(remoteIds.sort((a, b) => a > b));
  }

  sendReport = (question, response) => {
    if ((response.rating !== undefined) && (response.rating === 5)) {
      this.setState({ sendStoreConfirmationVisible: true, questionVisibile: false });
    } else {
      this.closeModal();
    }
    feedback.postQuestion(question, response)
      .then((result) => {
        if (result.status === 200) {
          AsyncStorage.getItem('@app2sales-feedback-questions').then((value) => {
            const localQuestions = JSON.parse(value);
            localQuestions.questionMap = localQuestions.questionMap.map((item) => {
              const newItem = {};
              Object.assign(newItem, item);
              if (item.index === this.state.question.index) {
                newItem.answered = true;
              }
              return newItem;
            });
            AsyncStorage.setItem(
              '@app2sales-feedback-questions',
              JSON.stringify(localQuestions)
            );
          });
        }
      })
      .catch((error) => {
        console.log('Erro: ', error);
      });
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

  renderEvaluationAlternatives = () => {
    const { question } = this.state;
    if (question.question.alternativeImageType === undefined ||
      (question.question.alternativeImageType !== 'star' && question.question.alternativeImageType === 'emoji')) {
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
            onPress={() => { this.closeModal(); feedback.sendToStore(); }}>
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
      return question.question.evaluation ?
        this.getComponentEvaluationApp() :
        this.getComponentMultipleChoice();
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
  type: PropTypes.string
};

Question.defaultProps = {
  title: 'Que tal nos dar um feedback?',
  type: 'questions'
};

export default Question;
