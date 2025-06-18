import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ActivityIndicator, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { TextInput } from 'react-native-gesture-handler';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import authStore from '../stores/authStore';
import theme from '../theme/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        <ImageBackground source={require('../assets/lined-paper.png')} style={styles.bg} imageStyle={styles.paperImage}>
            <SafeAreaView style={styles.safe}>
                <View style={styles.card}>
                    <Text style={styles.title}>Register</Text>
                    <View style={styles.inputWrapper}>
                        <Icon name="person-outline" size={20} color={theme.colors.lines} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder='Username'
                            placeholderTextColor={theme.colors.textPrimary + '99'}
                            value={username}
                            onChangeText={setUsername}
                        />
                    </View>
                    <View style={styles.inputWrapper}>
                        <Icon name="lock-closed-outline" size={20} color={theme.colors.lines} style={styles.inputIcon} />
                        <TextInput
                            style={styles.input}
                            placeholder='Password'
                            placeholderTextColor={theme.colors.textPrimary + '99'}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

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

                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.linkText}>Already have an account?
                            <Text style={{ color: theme.colors.accent, fontFamily: theme.typography.body.fontFamily, }}> Log in</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
});


export default RegisterScreen;

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