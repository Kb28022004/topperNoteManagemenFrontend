import { useState, useEffect } from 'react';

const useDebounceSearch = (delay = 500) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [localSearch, setLocalSearch] = useState('');

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
