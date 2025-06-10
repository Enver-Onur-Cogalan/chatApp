import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { observer } from 'mobx-react-lite';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen'
import ChatScreen from '../screens/ChatScreen';
import authStore from '../stores/authStore';

const Stack = createNativeStackNavigator();

const AppNavigator = observer(() => {
    const isLoggedIn = authStore.isLoggedIn;

    useEffect(() => {
        authStore.loadUserFromStorage();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <Stack.Screen name='Chat' component={ChatScreen} />
                ) : (
                    <>
                        <Stack.Screen name='Login' component={LoginScreen} />
                        <Stack.Screen name='Register' component={RegisterScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
});


export default AppNavigator;