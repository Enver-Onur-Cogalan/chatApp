import { Platform } from "react-native";
import { io } from "socket.io-client";

const HOST = Platform.OS === 'android'
    ? '10.0.2.2'
    : 'localhost';

const socket = io(`http://${HOST}:5001`, {
    transports: ['websocket'],
});

export default socket;