export const colors = {
    background: '#FFF9E5',
    lines: '#B0A898',
    edgeShadow: '#D3C9B9',
    postItYellow: '#FFF2A6',
    postItGreen: '#A7FFC4',
    postItPink: '#FFB3C0',
    postItBlue: '#A6E0FF',
    accent: '#4A90E2',
    online: '#6EC664',
    offline: '#C14A4A',
    textPrimary: '#333333',
    errorText: '#D0021B',
} as const;

export const typography = {
    header: {
        fontFamily: 'PatrickHand-Regular',
        fontSize: 24,
    },
    subHeader: {
        fontFamily: 'ReenieBeanie-Regular',
        fontSize: 14,
    },
    body: {
        fontFamily: 'Inter-Regular',
        fontSize: 18,
    },
    timestamp: {
        fontFamily: 'Inter-Light',
        fontSize: 12,
    },
    button: {
        fontFamily: 'Inter-Medium',
        fontSize: 16,
    },
    modalTitle: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 16,
    },
} as const;

export default { colors, typography };