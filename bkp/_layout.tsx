import { Stack } from 'expo-router';
import { BluetoothProvider } from "rn-bluetooth-classic";

export default function RootLayout() {
  return (
    <BluetoothProvider>
        <Stack>
          <Stack.Screen name="Index"  options={{ headerShown: false }} />
        </Stack>
    </BluetoothProvider>
  );
}
