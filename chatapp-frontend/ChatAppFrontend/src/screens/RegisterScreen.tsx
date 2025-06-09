import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import authStore from '../stores/authStore';
import { TextInput } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    Login: undefined;
    Chat: undefined;
}

const RegisterScreen = observer(() => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        await authStore.register(username, password);
        if (authStore.isLoggedIn) {
            navigation.navigate('Chat');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>

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

            {authStore.error !== '' && (
                <Text style={styles.errorText}>{authStore.error}</Text>
            )}

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={authStore.isLoading}>
                {authStore.isLoading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <Text style={styles.buttonText}>Register</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}>Already have an account? Log in</Text>
            </TouchableOpacity>
        </View>
    )
})


export default RegisterScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fff',
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
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
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
    link: {
        color: '#1E90FF',
        textAlign: 'center',
        marginTop: 10,
    }
});