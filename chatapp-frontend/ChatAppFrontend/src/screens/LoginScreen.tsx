import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import authStore from '../stores/authStore';

type RootStackParamList = {
    Login: undefined;
    Chat: undefined;
};

const LoginScreen = observer(() => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        authStore.login(username, password);
    };

    useEffect(() => {
        if (authStore.isLoggedIn) {
            navigation.replace('Chat');
        }
    }, [authStore.isLoggedIn]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log in</Text>

            <TextInput
                style={styles.input}
                placeholder='Username'
                value={username}
                onChangeText={setUsername}
            />

            <TextInput
                style={styles.input}
                placeholder='Password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {authStore.isLoading ? (
                <ActivityIndicator size='small' color='#000' />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Log in</Text>
                </TouchableOpacity>
            )}

            {authStore.error ? <Text style={styles.error}>{authStore.error}</Text> : null}
        </View>
    )
})

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: 'black',
    },
    input: {
        borderWidth: 1,
        borderColor: '#aaa',
        padding: 10,
        marginBottom: 12,
        borderRadius: 6,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 6,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});