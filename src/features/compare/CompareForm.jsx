import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useGetAllPokemonNamesQuery, useGetPokemonDetailQuery } from '../pokemon/pokemonApi';
import styles from './CompareForm.module.css';

const validationSchema = Yup.object({
    pokemon1: Yup.string().required('Elegí el primer pokémon'),
    pokemon2: Yup.string()
        .required('Elegí el segundo pokémon')
        .test('distinto-al-primero', 'No podés comparar el mismo pokémon', function (value) {
            return value !== this.parent.pokemon1;
        }),
});

function CompareForm() {
    const { data: allNamesData, isLoading: isLoadingNames } = useGetAllPokemonNamesQuery();

    const [submitted, setSubmitted] = useState(null);

    const formik = useFormik({
        initialValues: { pokemon1: '', pokemon2: '' },
        validationSchema,
        onSubmit: (values) => {
            setSubmitted(values);
        },
    });

    const { data: pokemon1Data } = useGetPokemonDetailQuery(submitted?.pokemon1, {
        skip: !submitted,
    });
    const { data: pokemon2Data } = useGetPokemonDetailQuery(submitted?.pokemon2, {
        skip: !submitted,
    });

    const allNames = allNamesData?.results.map((p) => p.name) || [];

    return (
        <div className={styles.container}>
            <h2>Comparar Pokémon</h2>

            <form onSubmit={formik.handleSubmit} className={styles.form}>
                <div className={styles.field}>
                    <label htmlFor="pokemon1">Primer pokémon</label>
                    <input
                        id="pokemon1"
                        name="pokemon1"
                        list="pokemon-options"
                        value={formik.values.pokemon1}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isLoadingNames}
                    />
                    {formik.touched.pokemon1 && formik.errors.pokemon1 && (
                        <p className={styles.error}>{formik.errors.pokemon1}</p>
                    )}
                </div>

                <div className={styles.field}>
                    <label htmlFor="pokemon2">Segundo pokémon</label>
                    <input
                        id="pokemon2"
                        name="pokemon2"
                        list="pokemon-options"
                        value={formik.values.pokemon2}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isLoadingNames}
                    />
                    {formik.touched.pokemon2 && formik.errors.pokemon2 && (
                        <p className={styles.error}>{formik.errors.pokemon2}</p>
                    )}
                </div>

                <datalist id="pokemon-options">
                    {allNames.map((name) => (
                        <option key={name} value={name} />
                    ))}
                </datalist>

                <button type="submit">Comparar</button>
            </form>

            {pokemon1Data && pokemon2Data && (
                <ComparisonView pokemon1={pokemon1Data} pokemon2={pokemon2Data} />
            )}
        </div>
    );
}

function ComparisonView({ pokemon1, pokemon2 }) {
    return (
        <div className={styles.comparison}>
            <div className={styles.comparisonHeader}>
                <h3>{pokemon1.name}</h3>
                <h3>{pokemon2.name}</h3>
            </div>

            {pokemon1.stats.map((stat1) => {
                const stat2 = pokemon2.stats.find((s) => s.stat.name === stat1.stat.name);
                return (
                    <div key={stat1.stat.name} className={styles.statRow}>
                        <span className={styles.statValue}>{stat1.base_stat}</span>
                        <span className={styles.statName}>{stat1.stat.name}</span>
                        <span className={styles.statValue}>{stat2?.base_stat ?? '-'}</span>
                    </div>
                );
            })}
        </div>
    );
}

export default CompareForm;
