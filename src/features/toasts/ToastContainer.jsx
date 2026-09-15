import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeToast } from './toastsSlice';
import styles from './ToastContainer.module.css';

const TOAST_DURATION_MS = 2500;

function ToastContainer() {
    const items = useSelector((state) => state.toasts.items);
    const dispatch = useDispatch();

    return (
        <div className={styles.container}>
            {items.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onDone={() => dispatch(removeToast(toast.id))}
                />
            ))}
        </div>
    );
}

function Toast({ toast, onDone }) {
    useEffect(() => {
        const timeoutId = setTimeout(onDone, TOAST_DURATION_MS);
        return () => clearTimeout(timeoutId);
    }, [onDone]);

    return (
        <div className={`${styles.toast} ${styles[toast.type] || ''}`}>{toast.message}</div>
    );
}

export default ToastContainer;
