import { CapacitorConfig } from '@capacitor/cli';

/*
// const config: CapacitorConfig = {
//   appId: 'io.ionic.starter',
//   appName: 'correspondence',
//   webDir: 'www',
//   bundledWebRuntime: false
// };

// export default config;
*/

const config: CapacitorConfig = {
  appId: 'io.ionic.starter.esmartsoft.university.registration',
  appName: 'Smart University Registration',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: '#ffffffff',
      launchAutoHide: true,
      androidSplashResourceName: 'launch_splash',
      SplashScreenDelay: false
    },
    LocalNotifications: {
      smallIcon: 'icon_msg48',
      iconColor: "#488AFF"
      //sound: "birds.wav",
      //iconColor: "#488AFF",
    },
    PushNotifications: { presentation0ptions: ["badge", "sound", "alert"] }
  },
  cordova: {
    preferences: {
      "LottieFullScreen": "true",
      "LottieHideAfterAnimationEnd": "true",
      "LottieAnimationLocation": "public/assets/splash.json",
    }
  }
};

export default config;

// npm i https://github.com/timbru31/cordova-plugin-lottie-splashscreen