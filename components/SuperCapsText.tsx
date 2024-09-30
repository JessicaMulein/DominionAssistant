import React from 'react';
import { Text, StyleSheet, View, TextStyle } from 'react-native';

interface SuperCapsTextProps {
  children: string;
  style?: TextStyle;
  fontSize?: number;
}

const SuperCapsText: React.FC<SuperCapsTextProps> = ({ children, style, fontSize = 24 }) => {
  if (!children || typeof children !== 'string') {
    return null;
  }

  const firstLetter = children.charAt(0);
  const restOfText = children.slice(1);

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          style,
          { ...styles.firstLetter, fontSize: fontSize * 1.05, lineHeight: fontSize },
        ]}
      >
        {firstLetter}
      </Text>
      <Text style={[styles.text, style, { fontSize, lineHeight: fontSize }]}>{restOfText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  text: {
    fontFamily: 'CharlemagneStdBold',
  },
  firstLetter: {
    textTransform: 'uppercase',
  },
});

export default SuperCapsText;
