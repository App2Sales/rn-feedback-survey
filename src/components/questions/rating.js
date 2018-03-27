import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './styles';


class RatingQuestionComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      title,
      questionTitle,
      renderButtons,
      renderRatingAlternatives
    } = this.props;
    
    return (
      <View style={styles.whiteBoxContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.question}>{questionTitle}</Text>
        <View style={styles.alternativesEvaluationContainer}>
          {renderRatingAlternatives}
        </View>
        {renderButtons}
      </View>
    );
  }
}

export default RatingQuestionComponent;
