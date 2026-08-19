import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/post/:id" element={<PostPage />} />
      <Route path="/admin/*" element={<AdminPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
