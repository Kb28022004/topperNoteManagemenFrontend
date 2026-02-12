export const validatePhoneNumber = (number) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!number) {
        return { isValid: false, error: 'Phone number is required' };
    }
    if (!phoneRegex.test(number)) {
        return { isValid: false, error: 'Please enter a valid 10-digit phone number' };
    }
    return { isValid: true, error: '' };
};
