import { useParams, Link } from 'react-router-dom';
import { useGetPokemonDetailQuery } from './pokemonApi';
import styles from './PokemonDetail.module.css';

const MAX_BASE_STAT = 255;

function PokemonDetail() {
    const { name } = useParams();
    const { data, isLoading, error, refetch } = useGetPokemonDetailQuery(name);

    if (isLoading) return <p>Cargando...</p>;

    if (error) {
        return (
            <div className={styles.container}>
                <p>Error al cargar {name}.</p>
                <button onClick={refetch}>Reintentar</button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link to="/">← Volver al listado</Link>

            <h2 className={styles.name}>
                {data.name} <span className={styles.id}>#{data.id}</span>
            </h2>

            <div className={styles.sprites}>
                <img src={data.sprites.front_default} alt={`${data.name} normal`} />
                <img src={data.sprites.back_default} alt={`${data.name} de espaldas`} />
                {data.sprites.front_shiny && (
                    <img src={data.sprites.front_shiny} alt={`${data.name} shiny`} />
                )}
            </div>

            <div className={styles.physical}>
                <p>Altura: {data.height / 10} m</p>
                <p>Peso: {data.weight / 10} kg</p>
            </div>

            <div className={styles.section}>
                <h3>Tipos</h3>
                <div className={styles.tags}>
                    {data.types.map((t) => (
                        <span key={t.type.name} className={styles.tag}>
                            {t.type.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Habilidades</h3>
                <div className={styles.tags}>
                    {data.abilities.map((a) => (
                        <span key={a.ability.name} className={styles.tag}>
                            {a.ability.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <h3>Stats</h3>
                {data.stats.map((s) => {
                    const percentage = Math.min((s.base_stat / MAX_BASE_STAT) * 100, 100);
                    return (
                        <div key={s.stat.name} className={styles.statRow}>
                            <span className={styles.statName}>{s.stat.name}</span>
                            <div className={styles.statBarBg}>
                                <div
                                    className={styles.statBarFill}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className={styles.statValue}>{s.base_stat}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PokemonDetail;
