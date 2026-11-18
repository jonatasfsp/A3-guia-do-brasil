import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Explore from './pages/Explore.jsx';
import Result from './pages/Result.jsx';
import Catalog from './pages/Catalog.jsx';
import About from './pages/About.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/explorar" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/estado/:id" element={<Result tipo="estado" />} />
        <Route path="/municipio/:id" element={<Result tipo="municipio" />} />
        <Route path="/catalogo/:tipo" element={<Catalog />} />
        <Route path="/sobre" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
