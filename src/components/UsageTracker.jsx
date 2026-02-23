import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useUpdateStatsMutation } from '../features/api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { updateSessionSeconds, resetSession } from '../features/usageSlice';

const UsageTracker = () => {
    const dispatch = useDispatch();
    const [updateStats] = useUpdateStatsMutation();
    const [isStudent, setIsStudent] = useState(false);
    const sessionStart = useRef(Date.now());
    const appState = useRef(AppState.currentState);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setIsStudent(user.role === 'STUDENT');
                }
            } catch (e) {
                console.log("Tracker Auth Check Error:", e);
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (!isStudent) return;

        // Local timer to update Redux for real-time UI
        const ticker = setInterval(() => {
            if (appState.current === 'active') {
                dispatch(updateSessionSeconds());
            }
        }, 1000);

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground
                sessionStart.current = Date.now();
                dispatch(resetSession()); // Start a fresh session counter for UI
            } else if (
                appState.current === 'active' &&
                nextAppState.match(/inactive|background/)
            ) {
                // App went to background
                const timeSpent = Math.floor((Date.now() - sessionStart.current) / 1000);
                if (timeSpent > 0) {
                    updateStats({ timeSpent }).catch(err => console.log("Usage Sync Error:", err));
                }
            }
            appState.current = nextAppState;
        });

        // Periodic sync every 5 minutes while active
        const interval = setInterval(() => {
            if (appState.current === 'active') {
                const timeSpent = Math.floor((Date.now() - sessionStart.current) / 1000);
                if (timeSpent > 30) { // minimum 30 seconds to sync
                    updateStats({ timeSpent }).catch(err => console.log("Periodic Sync Error:", err));
                    sessionStart.current = Date.now(); // reset session start for next interval
                    dispatch(resetSession());
                }
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => {
            subscription.remove();
            clearInterval(interval);
            clearInterval(ticker);

            // Final sync on unmount
            const timeSpent = Math.floor((Date.now() - sessionStart.current) / 1000);
            if (isStudent && timeSpent > 5) {
                updateStats({ timeSpent }).catch(err => console.log("Final Sync Error:", err));
            }
        };
    }, [isStudent, updateStats]);

    return null; // Invisible component
};

export default UsageTracker;
