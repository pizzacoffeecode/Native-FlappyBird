import * as Font from "expo-font";

export default useFonts = async () =>
    await Font.loadAsync({
        'flappy': require('../assets/fonts/FlappyBirdy.ttf'),
    });