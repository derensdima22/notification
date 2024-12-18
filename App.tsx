/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useCallback, useEffect, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  ToastAndroid,
  useColorScheme,
  View,
} from 'react-native';

import {Colors, Header} from 'react-native/Libraries/NewAppScreen';
import Clipboard from '@react-native-clipboard/clipboard';
import {Notifications} from 'react-native-notifications';

function App(): React.JSX.Element {
  const [token, setToken] = useState<string>('');
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const copyToClipboard = () => {
    Clipboard.setString(token);
    ToastAndroid.show('Text copied to the clipboard', ToastAndroid.SHORT);
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Permission to notify has been granted:', authStatus);
    } else {
      console.log('Notification authorization denied');
    }
  };

  const setupFirebaseMessaging = useCallback(async () => {
    await requestUserPermission();

    const tokenFCM = await messaging().getToken();
    console.log('FCM Token:', tokenFCM);
    setToken(tokenFCM);

    messaging().onMessage(async remoteMessage => {
      console.log(
        'Notification when the application is active:',
        remoteMessage,
      );
      Alert.alert('New notice', JSON.stringify(remoteMessage.notification));
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Notification in the background:', remoteMessage);
    });
  }, []);

  useEffect(() => {
    setupFirebaseMessaging();
  }, [setupFirebaseMessaging]);

  useEffect(() => {
    const notification = async () => {
      if (Platform.OS === 'android') {
        const response =
          await Notifications.isRegisteredForRemoteNotifications();

        console.log('response', response);
        if (!response) {
          Notifications.getInitialNotification();
        }
      }
    };

    notification();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
      </ScrollView>
      <View style={styles.sectionToken}>
        <Text style={styles.sectionTokenTitle}>FCM Token:</Text>
        <Text style={styles.FCMToken}>{token}</Text>
        <Button title="Copy" onPress={copyToClipboard} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  sectionToken: {
    padding: 20,
  },
  sectionTokenTitle: {
    paddingBottom: 5,
  },
  FCMToken: {
    borderColor: 'black',
    borderWidth: 1,
    padding: 5,
  },
});

export default App;
