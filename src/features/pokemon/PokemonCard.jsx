import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useGetPokemonDetailQuery } from './pokemonApi';
import { addFavorite, removeFavorite } from '../favorites/favoritesSlice';
import { MAX_TEAM_SIZE } from '../favorites/constants';
import { addToast } from '../toasts/toastsSlice';
import SkeletonCard from '../../components/SkeletonCard';
import ProgressiveImage from '../../components/ProgressiveImage';
import styles from './PokemonCard.module.css';

const TYPE_COLORS = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
};

const capitalizar = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);

function PokemonCard({ name }) {
    const { data, isLoading, error, refetch } = useGetPokemonDetailQuery(name);

    // Si en el primer render ya hay datos, salieron del cache rehidratado.
    const [fromCache] = useState(() => !isLoading);

    const dispatch = useDispatch();
    const team = useSelector((state) => state.favorites.team);
    const isFavorite = team.includes(name);

    const toggleFavorite = () => {
        if (isFavorite) {
            dispatch(removeFavorite(name));
            dispatch(
                addToast({
                    message: `${capitalizar(data.name)} removido del equipo`,
                    type: 'info',
                }),
            );
        } else if (team.length < MAX_TEAM_SIZE) {
            dispatch(addFavorite(name));
            dispatch(
                addToast({
                    message: `${capitalizar(data.name)} agregado al equipo`,
                    type: 'success',
                }),
            );
        } else {
            dispatch(addToast({ message: 'Tu equipo ya tiene 6 pokémon', type: 'warning' }));
        }
    };

    if (isLoading) return <SkeletonCard />;

    if (error) {
        return (
            <div className={styles.card}>
                <p>Error al cargar {name}.</p>
                <button onClick={refetch}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <button
                type="button"
                onClick={toggleFavorite}
                className={styles.favoriteButton}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
                {isFavorite ? '★' : '☆'}
            </button>

            <span
                className={styles.cacheIndicator}
                title={fromCache ? 'Datos desde cache' : 'Datos recién pedidos'}
            >
                {fromCache ? '💾' : '🌐'}
            </span>

            <Link to={`/pokemon/${data.name}`} className={styles.cardLink}>
                <ProgressiveImage
                    src={data.sprites.front_default}
                    alt={data.name}
                    className={styles.sprite}
                />
                <p className={styles.number}>#{data.id}</p>
                <p className={styles.name}>{data.name}</p>
                <div className={styles.types}>
                    {data.types.map((t) => (
                        <span
                            key={t.type.name}
                            className={styles.badge}
                            style={{ backgroundColor: TYPE_COLORS[t.type.name] || '#777' }}
                        >
                            {t.type.name}
                        </span>
                    ))}
                </div>
            </Link>
        </div>
    );
}

export default PokemonCard;
