import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import PokemonCard from '../pokemon/PokemonCard';
import { reorderFavorites } from './favoritesSlice';
import { MAX_TEAM_SIZE } from './constants';
import NotFound from '../../components/NotFound';
import styles from './FavoritesTeam.module.css';

function FavoritesTeam() {
    const team = useSelector((state) => state.favorites.team);
    const dispatch = useDispatch();

    const intercambiar = (desde, hacia) => {
        const nuevoEquipo = [...team];
        [nuevoEquipo[desde], nuevoEquipo[hacia]] = [nuevoEquipo[hacia], nuevoEquipo[desde]];
        dispatch(reorderFavorites(nuevoEquipo));
    };

    return (
        <div className={styles.container}>
            <Link to="/">← Volver al listado</Link>

            <h2>
                Mi Equipo ({team.length}/{MAX_TEAM_SIZE})
            </h2>

            {team.length === 0 && (
                <NotFound
                    icon="⭐"
                    title="Tu equipo está vacío"
                    subtitle="Volvé al listado y tocá la estrella de algún pokémon para agregarlo."
                />
            )}

            <div className={styles.grid}>
                {team.map((name, index) => (
                    <div key={name} className={styles.member}>
                        <PokemonCard name={name} />

                        <div className={styles.reorder}>
                            <button
                                type="button"
                                onClick={() => intercambiar(index, index - 1)}
                                disabled={index === 0}
                                aria-label={`Mover ${name} hacia arriba`}
                            >
                                ↑
                            </button>
                            <span className={styles.position}>{index + 1}</span>
                            <button
                                type="button"
                                onClick={() => intercambiar(index, index + 1)}
                                disabled={index === team.length - 1}
                                aria-label={`Mover ${name} hacia abajo`}
                            >
                                ↓
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FavoritesTeam;
