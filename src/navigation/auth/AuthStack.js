import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../../screens/OnboardingScreen';
import RoleSelectionScreen from '../../screens/auth/RoleSelectionScreen';
import LoginWithPhoneScreen from '../../screens/auth/LoginWithPhoneScreen';
import VerifyMobileScreen from '../../screens/auth/VerifyMobileScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Onboarding"
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
      <Stack.Screen name="Login" component={LoginWithPhoneScreen} />
      <Stack.Screen name="VerifyMobile" component={VerifyMobileScreen} />
    </Stack.Navigator>
  );
}
