import { useGetAllTypesQuery } from '../pokemon/pokemonApi';
import styles from './FilterPanel.module.css';

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function FilterPanel({ selectedType, selectedGeneration, onTypeChange, onGenerationChange }) {
    const { data } = useGetAllTypesQuery();

    return (
        <div className={styles.panel}>
            <select
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
                className={styles.select}
            >
                <option value="">Todos los tipos</option>
                {data?.results?.map((type) => (
                    <option key={type.name} value={type.name}>
                        {type.name}
                    </option>
                ))}
            </select>

            <select
                value={selectedGeneration}
                onChange={(e) => onGenerationChange(e.target.value)}
                className={styles.select}
            >
                <option value="">Todas las generaciones</option>
                {GENERATIONS.map((gen) => (
                    <option key={gen} value={gen}>
                        Generación {gen}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default FilterPanel;
