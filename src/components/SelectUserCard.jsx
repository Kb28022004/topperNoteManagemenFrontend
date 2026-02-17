import { View, StyleSheet, Image, Pressable } from 'react-native';
import React, { memo } from 'react';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import AppText from './AppText';

const SelectUserCard = ({ imageSource, title, description, routeName, params }) => {
  const navigation = useNavigation();

  return (
    <Pressable
      onPress={() => navigation.navigate(routeName, params)}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.8 }
      ]}
    >
      <Image
        source={imageSource}
        style={styles.logo}
      />

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <AppText weight="bold" style={styles.title}>
            {title}
          </AppText>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#959595"
            style={styles.icon}
          />
        </View>

        <AppText style={styles.description}>
          {description}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 130,
    backgroundColor: "rgba(58, 60, 63, 0.5)",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },

  textContainer: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  title: {
    fontSize: 20,
    color: "white",
  },

  description: {
    fontSize: 16,
    color: "#959595",
  },

  icon: {
    marginLeft: 10,
  },
});

export default memo(SelectUserCard);
