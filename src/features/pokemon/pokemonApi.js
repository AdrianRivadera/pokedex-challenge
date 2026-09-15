import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const ALL_POKEMON_LIMIT = 1351;

export const pokemonApi = createApi({
    reducerPath: 'pokemonApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://pokeapi.co/api/v2/' }),
    tagTypes: ['Pokemon', 'PokemonDetail'],
    keepUnusedDataFor: 3600,
    endpoints: (builder) => ({
        getPokemonList: builder.query({
            query: ({ limit = 20, offset = 0 } = {}) =>
                `pokemon?limit=${limit}&offset=${offset}`,
            providesTags: ['Pokemon'],
        }),

        getPokemonDetail: builder.query({
            query: (nameOrId) => `pokemon/${nameOrId}`,
            providesTags: (result, error, nameOrId) => [
                { type: 'PokemonDetail', id: nameOrId },
            ],
        }),

        getAllPokemonNames: builder.query({
            query: () => `pokemon?limit=${ALL_POKEMON_LIMIT}&offset=0`,
        }),

        getPokemonByType: builder.query({
            query: (typeName) => `type/${typeName}`,
        }),

        getPokemonByGeneration: builder.query({
            query: (genNumber) => `generation/${genNumber}`,
        }),

        getAllTypes: builder.query({
            query: () => `type`,
        }),
    }),
});

export const {
    useGetPokemonListQuery,
    useGetPokemonDetailQuery,
    useGetAllPokemonNamesQuery,
    useGetPokemonByTypeQuery,
    useGetPokemonByGenerationQuery,
    useGetAllTypesQuery,
} = pokemonApi;
