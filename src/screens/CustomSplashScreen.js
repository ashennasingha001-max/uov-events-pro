import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen({ navigation }) {
  useEffect(() => {
    
    setTimeout(() => {
      navigation.replace('Login'); 
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/splash.png')} 
        style={styles.image}
        resizeMode="cover" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: width, height: height }
});
