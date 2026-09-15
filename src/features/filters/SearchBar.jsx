import { useState, useEffect } from 'react';
import styles from './SearchBar.module.css';

const DEBOUNCE_MS = 300;

function SearchBar({ onSearch }) {
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(inputValue);
        }, DEBOUNCE_MS);

        return () => clearTimeout(timeoutId);
    }, [inputValue, onSearch]);

    return (
        <input
            type="text"
            className={styles.input}
            placeholder="Buscar pokémon por nombre..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
        />
    );
}

export default SearchBar;
