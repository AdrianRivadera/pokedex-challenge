import { Link } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import styles from './App.module.css';
import ToastContainer from './features/toasts/ToastContainer';
import ConnectionStatus from './components/ConnectionStatus';

function App() {
    return (
        <div>
            <header className={styles.header}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Pokedex</h1>
                    <ConnectionStatus />
                </div>

                <nav className={styles.nav}>
                    <Link to="/" className={styles.navLink}>
                        Inicio
                    </Link>
                    <Link to="/equipo" className={styles.navLink}>
                        Mi Equipo
                    </Link>
                    <Link to="/comparar" className={styles.navLink}>
                        Comparar
                    </Link>
                </nav>
            </header>

            <AppRouter />
            <ToastContainer />
        </div>
    );
}

export default App;
