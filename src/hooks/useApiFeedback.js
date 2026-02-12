import React, { useEffect } from 'react';
import { ToastAndroid, View } from 'react-native';

const useApiFeedback = (isSuccess, data, isError, error, onSuccess, successMessage) => {
    useEffect(() => {
        if (isSuccess && data) {
            const message = successMessage || data?.message || "Success";
            ToastAndroid.show(message, ToastAndroid.SHORT);
            if (onSuccess) {
                onSuccess(data);
            }
        }
    }, [isSuccess, data, onSuccess]);

    useEffect(() => {
        if (isError) {
            const message = error?.data?.message || error?.error || "Something went wrong";
            ToastAndroid.show(message, ToastAndroid.SHORT);
        }
    }, [isError, error]);
};

export default useApiFeedback;
