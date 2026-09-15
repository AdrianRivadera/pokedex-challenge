import { Routes, Route } from 'react-router-dom';
import PokemonList from '../features/pokemon/PokemonList';
import PokemonDetail from '../features/pokemon/PokemonDetail';
import FavoritesTeam from '../features/favorites/FavoritesTeam';
import CompareForm from '../features/compare/CompareForm';

function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<PokemonList />} />
            <Route path="/pokemon/:name" element={<PokemonDetail />} />
            <Route path="/equipo" element={<FavoritesTeam />} />
            <Route path="/comparar" element={<CompareForm />} />
        </Routes>
    );
}

export default AppRouter;