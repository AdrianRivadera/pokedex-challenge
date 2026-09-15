import { createSlice } from '@reduxjs/toolkit';
import { MAX_TEAM_SIZE } from './constants';

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState: {
        team: [],
    },
    reducers: {
        addFavorite: (state, action) => {
            const name = action.payload;

            if (state.team.includes(name)) return;
            if (state.team.length >= MAX_TEAM_SIZE) return;

            state.team.push(name);
        },

        removeFavorite: (state, action) => {
            state.team = state.team.filter((n) => n !== action.payload);
        },

        reorderFavorites: (state, action) => {
            state.team = action.payload;
        },
    },
});

export const { addFavorite, removeFavorite, reorderFavorites } = favoritesSlice.actions;

export default favoritesSlice.reducer;
