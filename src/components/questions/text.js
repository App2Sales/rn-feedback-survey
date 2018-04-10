import React, { Component } from 'react';
import { View, TextInput, Text } from 'react-native';
import styles from './styles';


class TextQuestionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      title,
      questionTitle,
      renderButtons,
      onchangeTextQuestion
    } = this.props;
    const textQuestionInputViewStyle = { ...styles.alternativesContainer, padding: 10 };

    return (
      <View style={styles.whiteBoxContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.question}>{questionTitle}</Text>
        <View style={textQuestionInputViewStyle}>
          <TextInput
            multiline
            onChangeText={onchangeTextQuestion}
            style={styles.textIpuntQuestion}
            underlineColorAndroid={'transparent'}
          />
          <View style={styles.line} />
        </View>
        {renderButtons}
      </View>);
  }
}

export default TextQuestionComponent;
