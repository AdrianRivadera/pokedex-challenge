import styles from './SkeletonCard.module.css';

function SkeletonCard() {
    return (
        <div className={styles.card}>
            <div className={styles.sprite} />
            <div className={styles.line} style={{ width: '30%' }} />
            <div className={styles.line} style={{ width: '60%' }} />
            <div className={styles.badges}>
                <div className={styles.badge} />
                <div className={styles.badge} />
            </div>
        </div>
    );
}

export default SkeletonCard;
