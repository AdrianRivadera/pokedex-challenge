import { useState, useEffect } from 'react';
import styles from './ConnectionStatus.module.css';

function ConnectionStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <div className={styles.status}>
            <span className={`${styles.dot} ${isOnline ? styles.online : styles.offline}`} />
            {isOnline ? 'Conectado' : 'Sin conexión'}
        </div>
    );
}

export default ConnectionStatus;
