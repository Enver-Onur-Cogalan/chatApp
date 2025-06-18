import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { TextInput } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import authStore from '../stores/authStore';
import socket from '../utils/socket';
import theme from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

type RootStackParamList = {
    Login: undefined;
    Chat: undefined;
    Register: undefined;
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
            socket.connect();
            socket.emit('register', authStore.username);

            navigation.reset({ index: 0, routes: [{ name: 'Chat' }] });
        }
    }, [authStore.isLoggedIn]);

    return (
        <ImageBackground source={require('../assets/lined-paper.png')} style={styles.bg} imageStyle={styles.paperImage}>
            <SafeAreaView style={styles.safe}>
                <View style={styles.card}>
                    <Text style={styles.title}>Log in</Text>
                    <View style={styles.inputWrapper}>
                        <Icon name='person-outline' size={20} color={theme.colors.lines} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder='Username'
                            placeholderTextColor={theme.colors.textPrimary + '99'}
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Icon name='lock-closed-outline' size={20} color={theme.colors.lines} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder='Password'
                            placeholderTextColor={theme.colors.textPrimary + '99'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    {authStore.isLoading ? (
                        <ActivityIndicator size='small' color='#000' />
                    ) : (
                        <TouchableOpacity style={styles.button} onPress={handleLogin}>
                            <Text style={styles.buttonText}>Log in</Text>
                            <Icon name='arrow-forward-outline' size={20} color='#fff' style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>
                            Don't have an account?
                            <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.body.fontFamily }}> Register</Text>
                        </Text>
                    </TouchableOpacity>

                    {authStore.error ? <Text style={styles.error}>{authStore.error}</Text> : null}
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
})

export default LoginScreen;

const styles = StyleSheet.create({
    bg: {
        flex: 1,
    },
    paperImage: {
        resizeMode: 'repeat',
    },
    safe: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    title: {
        fontFamily: theme.typography.header.fontFamily,
        fontSize: theme.typography.header.fontSize,
        color: theme.colors.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.edgeShadow,
        borderRadius: 20,
        paddingVertical: 8,
        marginTop: 8,
        marginBottom: 12,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        height: 40,
        fontFamily: theme.typography.body.fontFamily,
        fontSize: theme.typography.body.fontSize,
        color: theme.colors.textPrimary,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.accent,
        borderRadius: 20,
        paddingVertical: 12,
        marginTop: 8,
        marginBottom: 12,
    },
    buttonText: {
        color: '#fff',
        fontFamily: theme.typography.button.fontFamily,
        fontSize: theme.typography.button.fontSize,
    },
    error: {
        color: theme.colors.errorText,
        marginTop: 10,
        textAlign: 'center',
    },
    linkText: {
        textAlign: 'center',
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.body.fontFamily,
    },
});