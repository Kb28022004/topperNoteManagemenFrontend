import { useEffect, useRef } from 'react';
import { useAlert } from '../context/AlertContext';

const useApiFeedback = (isSuccess, data, isError, error, onSuccess, successMessage) => {
    const { showAlert } = useAlert();
    const onSuccessRef = useRef(onSuccess);

    // Update ref when callback changes
    useEffect(() => {
        onSuccessRef.current = onSuccess;
    }, [onSuccess]);

    useEffect(() => {
        if (isSuccess && data) {
            const message = successMessage || data?.message || "Success";
            showAlert("Success", message, "success");
            if (onSuccessRef.current) {
                onSuccessRef.current(data);
            }
        }
    }, [isSuccess, data]); // Removed onSuccess from dependencies

    useEffect(() => {
        if (isError) {
            const message = error?.data?.message || error?.error || "Something went wrong";
            showAlert("Error", message, "error");
        }
    }, [isError, error]);
};

export default useApiFeedback;
