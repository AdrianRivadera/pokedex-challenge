import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import { pokemonApi } from '../features/pokemon/pokemonApi';
import favoritesReducer from '../features/favorites/favoritesSlice';
import toastsReducer from '../features/toasts/toastsSlice';

const MAX_PERSISTED_DETAILS = 80;

const localStorageEngine = {
    getItem: (key) => Promise.resolve(window.localStorage.getItem(key)),
    setItem: (key, value) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
    },
    removeItem: (key) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
    },
};

// se persisten solo los detalles resueltos más recientes
const trimPersistedCacheTransform = createTransform(
    (inboundState) => {
        const detailEntries = Object.entries(inboundState.queries || {}).filter(
            ([, query]) =>
                query?.status === 'fulfilled' && query.endpointName === 'getPokemonDetail',
        );

        const mostRecent = detailEntries
            .sort(([, a], [, b]) => b.fulfilledTimeStamp - a.fulfilledTimeStamp)
            .slice(0, MAX_PERSISTED_DETAILS);

        const cleanedQueries = {};

        mostRecent.forEach(([key, query]) => {
            cleanedQueries[key] = {
                ...query,
                data: {
                    id: query.data.id,
                    name: query.data.name,
                    height: query.data.height,
                    weight: query.data.weight,
                    sprites: {
                        front_default: query.data.sprites.front_default,
                        back_default: query.data.sprites.back_default,
                        front_shiny: query.data.sprites.front_shiny,
                    },
                    types: query.data.types,
                    abilities: query.data.abilities,
                    stats: query.data.stats,
                },
            };
        });

        return { ...inboundState, queries: cleanedQueries };
    },
    (outboundState) => outboundState,
    { whitelist: ['pokemonApi'] },
);

const pokemonApiPersistConfig = {
    key: 'pokemonApi',
    storage: localStorageEngine,
    transforms: [trimPersistedCacheTransform],
    // El cache de RTK Query cambia en cada card que carga
    throttle: 1000,
};

const favoritesPersistConfig = {
    key: 'favorites',
    storage: localStorageEngine,
};

const rootReducer = combineReducers({
    pokemonApi: persistReducer(pokemonApiPersistConfig, pokemonApi.reducer),
    favorites: persistReducer(favoritesPersistConfig, favoritesReducer),
    toasts: toastsReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            // Recorrer el cache completo en cada acción domina el tiempo de
            // render con el listado cargado.
            serializableCheck: false,
            immutableCheck: false,
        }).concat(pokemonApi.middleware),
});

export const persistor = persistStore(store);
