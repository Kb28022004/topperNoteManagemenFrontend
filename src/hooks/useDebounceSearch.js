import { useState, useEffect } from 'react';

const useDebounceSearch = (initialValue = '', delay = 500) => {
    const [searchQuery, setSearchQuery] = useState(initialValue);
    const [localSearch, setLocalSearch] = useState(initialValue);

    useEffect(() => {
        const handler = setTimeout(() => {
            setSearchQuery(localSearch);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [localSearch, delay]);

    return { searchQuery, localSearch, setLocalSearch };
};

export default useDebounceSearch;
