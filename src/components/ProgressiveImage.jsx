import { useState } from 'react';
import styles from './ProgressiveImage.module.css';

function ProgressiveImage({ src, alt, className }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={`${styles.wrapper} ${className || ''}`}>
            {!loaded && <div className={styles.placeholder} />}
            <img
                src={src}
                alt={alt}
                onLoad={() => setLoaded(true)}
                className={`${styles.image} ${loaded ? styles.visible : ''}`}
            />
        </div>
    );
}

export default ProgressiveImage;
