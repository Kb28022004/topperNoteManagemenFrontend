import { useState, useCallback } from 'react';

const useRefresh = (refetchFn) => {
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            if (refetchFn) {
                // If refetchFn returns a promise, await it
                await refetchFn();
            }
        } catch (error) {
            console.error("Refresh Error:", error);
        } finally {
            setRefreshing(false);
        }
    }, [refetchFn]);

    return { refreshing, onRefresh };
};

export default useRefresh;
