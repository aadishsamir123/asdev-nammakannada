import * as Speech from 'expo-speech';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';

interface InteractiveKannadaWordProps {
  word: string;
  transliteration: string;
  fontSize?: number;
  inline?: boolean;
}

export default function InteractiveKannadaWord({
  word,
  transliteration,
  fontSize = 24,
  inline = true,
}: InteractiveKannadaWordProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const theme = useTheme();

  const speakWord = () => {
    Speech.speak(word, {
      language: 'kn-IN',
      pitch: 1,
      rate: 0.85,
    });
  };

  const handlePress = () => {
    setShowTooltip(true);
    speakWord();
  };

  return (
    <>
      <Pressable onPress={handlePress} style={inline ? styles.inlineContainer : styles.blockContainer}>
        <View>
          <Text
            variant="headlineSmall"
            style={[
              styles.kannadaWord,
              {
                color: theme.colors.primary,
                fontSize,
              },
            ]}
          >
            {word}
          </Text>
          <View style={styles.dottedLine}>
            {[...Array(20)].map((_, i) => (
              <View
                key={i}
                style={[styles.dot, { backgroundColor: theme.colors.primary }]}
              />
            ))}
          </View>
        </View>
      </Pressable>

      <Modal
        visible={showTooltip}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTooltip(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTooltip(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Card style={styles.tooltipCard} mode="elevated">
              <Card.Content>
                <View style={styles.tooltipHeader}>
                  <View style={styles.tooltipTextContainer}>
                    <Text
                      variant="displaySmall"
                      style={[styles.tooltipKannada, { color: theme.colors.primary }]}
                    >
                      {word}
                    </Text>
                    <Text
                      variant="titleLarge"
                      style={[styles.tooltipTransliteration, { color: theme.colors.onSurfaceVariant }]}
                    >
                      {transliteration}
                    </Text>
                  </View>
                  <IconButton
                    icon="close"
                    size={24}
                    onPress={() => setShowTooltip(false)}
                    iconColor={theme.colors.onSurfaceVariant}
                  />
                </View>

                <View style={styles.audioButtonContainer}>
                  <IconButton
                    icon="volume-high"
                    size={40}
                    mode="contained"
                    onPress={speakWord}
                    iconColor={theme.colors.onPrimary}
                    containerColor={theme.colors.primary}
                    style={styles.audioButton}
                  />
                  <Text
                    variant="bodyMedium"
                    style={[styles.tapToHearText, { color: theme.colors.onSurfaceVariant }]}
                  >
                    Tap to hear pronunciation
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inlineContainer: {
    marginHorizontal: 2,
  },
  blockContainer: {
    marginVertical: 4,
  },
  kannadaWord: {
    fontWeight: '600',
    paddingBottom: 4,
  },
  dottedLine: {
    flexDirection: 'row',
    height: 2,
    marginTop: 2,
    gap: 3,
    overflow: 'hidden',
  },
  dot: {
    width: 3,
    height: 2,
    borderRadius: 1,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  tooltipCard: {
    borderRadius: 16,
    minWidth: 280,
    maxWidth: 400,
    elevation: 8,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tooltipTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  tooltipKannada: {
    fontWeight: '700',
    marginBottom: 8,
  },
  tooltipTransliteration: {
    fontStyle: 'italic',
    marginBottom: 4,
  },
  audioButtonContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  audioButton: {
    marginBottom: 8,
  },
  tapToHearText: {
    textAlign: 'center',
  },
});
