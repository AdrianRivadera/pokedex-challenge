import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    useGetPokemonListQuery,
    useGetAllPokemonNamesQuery,
    useGetPokemonByTypeQuery,
    useGetPokemonByGenerationQuery,
} from './pokemonApi';
import PokemonCard from './PokemonCard';
import SearchBar from '../filters/SearchBar';
import FilterPanel from '../filters/FilterPanel';
import NotFound from '../../components/NotFound';
import styles from './PokemonList.module.css';

const PAGE_SIZE = 20;

function PokemonList() {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchText = searchParams.get('search') || '';
    const selectedType = searchParams.get('type') || '';
    const selectedGeneration = searchParams.get('generation') || '';

    const hayFiltrosActivos = Boolean(searchText || selectedType || selectedGeneration);

    const updateFilter = useCallback(
        (key, value) => {
            const next = {
                search: searchText,
                type: selectedType,
                generation: selectedGeneration,
                [key]: value,
            };
            Object.keys(next).forEach((k) => {
                if (!next[k]) delete next[k];
            });
            setSearchParams(next);
        },
        [searchText, selectedType, selectedGeneration, setSearchParams],
    );

    const handleSearch = useCallback((value) => updateFilter('search', value), [updateFilter]);

    const handleTypeChange = useCallback((value) => updateFilter('type', value), [updateFilter]);

    const handleGenerationChange = useCallback(
        (value) => updateFilter('generation', value),
        [updateFilter],
    );

    const [offset, setOffset] = useState(0);
    const [scrolledNames, setScrolledNames] = useState([]);

    const {
        data: pageData,
        isFetching: isFetchingPage,
        error: pageError,
        refetch: refetchPage,
    } = useGetPokemonListQuery({ limit: PAGE_SIZE, offset }, { skip: hayFiltrosActivos });

    useEffect(() => {
        if (pageData?.results && !hayFiltrosActivos) {
            setScrolledNames((prev) => {
                const nuevos = pageData.results
                    .map((p) => p.name)
                    .filter((n) => !prev.includes(n));
                return [...prev, ...nuevos];
            });
        }
    }, [pageData, hayFiltrosActivos]);

    const { data: allNamesData } = useGetAllPokemonNamesQuery(undefined, {
        skip: !hayFiltrosActivos,
    });

    const { data: typeData } = useGetPokemonByTypeQuery(selectedType, {
        skip: !selectedType,
    });

    const { data: generationData } = useGetPokemonByGenerationQuery(selectedGeneration, {
        skip: !selectedGeneration,
    });

    const filteredNames = useMemo(() => {
        if (!hayFiltrosActivos) return [];

        let names = allNamesData?.results.map((p) => p.name) || [];

        if (selectedType && typeData) {
            const typeNames = new Set(typeData.pokemon.map((p) => p.pokemon.name));
            names = names.filter((n) => typeNames.has(n));
        }

        if (selectedGeneration && generationData) {
            const genNames = new Set(generationData.pokemon_species.map((p) => p.name));
            names = names.filter((n) => genNames.has(n));
        }

        if (searchText) {
            names = names.filter((n) => n.includes(searchText.toLowerCase()));
        }

        return names;
    }, [
        hayFiltrosActivos,
        allNamesData,
        selectedType,
        typeData,
        selectedGeneration,
        generationData,
        searchText,
    ]);

    const filterKey = `${searchText}|${selectedType}|${selectedGeneration}`;
    const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
    const [visibleFilteredCount, setVisibleFilteredCount] = useState(PAGE_SIZE);

    // Un filtro nuevo vuelve a empezar de 20. Se resuelve durante el render y no
    // en un efecto para cubrir también los cambios que vienen de la URL.
    if (filterKey !== prevFilterKey) {
        setPrevFilterKey(filterKey);
        setVisibleFilteredCount(PAGE_SIZE);
    }

    const observerRef = useRef(null);
    const lastItemRef = useCallback(
        (node) => {
            if (isFetchingPage) return;
            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    if (hayFiltrosActivos) {
                        setVisibleFilteredCount((prev) => prev + PAGE_SIZE);
                    } else {
                        setOffset((prev) => prev + PAGE_SIZE);
                    }
                }
            });

            if (node) observerRef.current.observe(node);
        },
        [isFetchingPage, hayFiltrosActivos],
    );

    const namesToRender = hayFiltrosActivos
        ? filteredNames.slice(0, visibleFilteredCount)
        : scrolledNames;

    return (
        <div>
            <div className={styles.containerFilters}>
                <FilterPanel
                    selectedType={selectedType}
                    selectedGeneration={selectedGeneration}
                    onTypeChange={handleTypeChange}
                    onGenerationChange={handleGenerationChange}
                />

                <SearchBar onSearch={handleSearch} />
            </div>

            <div className={styles.grid}>
                {namesToRender.length === 0 && hayFiltrosActivos && (
                    <NotFound
                        icon="🔍"
                        title="No se encontraron pokémon"
                        subtitle="Probá con otro nombre, tipo o generación."
                    />
                )}

                {namesToRender.map((name, index) => {
                    const isLast = index === namesToRender.length - 1;

                    const hayMasParaCargar = hayFiltrosActivos
                        ? visibleFilteredCount < filteredNames.length
                        : Boolean(pageData?.next);

                    return (
                        <div key={name} ref={isLast && hayMasParaCargar ? lastItemRef : null}>
                            <PokemonCard name={name} />
                        </div>
                    );
                })}

                {isFetchingPage && !hayFiltrosActivos && <p>Cargando más pokémon...</p>}

                {pageError && !hayFiltrosActivos && (
                    <div>
                        <p>Error al cargar más pokémon.</p>
                        <button onClick={refetchPage}>Reintentar</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PokemonList;
