import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen({ navigation }) {
  useEffect(() => {
    // තත්පර 3කට පස්සේ Home හෝ Login එකට යනවා
    setTimeout(() => {
      navigation.replace('Login'); // හෝ 'Home'
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/splash.png')} 
        style={styles.image}
        resizeMode="cover" // මේකෙන් මුළු ස්ක්‍රීන් එකම පිරෙනවා
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: width, height: height }
});