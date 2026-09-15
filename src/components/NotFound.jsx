import styles from './NotFound.module.css';

function NotFound({ icon, title, subtitle }) {
    return (
        <div className={styles.container}>
            <div className={styles.icon}>{icon}</div>
            <p className={styles.title}>{title}</p>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
    );
}

export default NotFound;
