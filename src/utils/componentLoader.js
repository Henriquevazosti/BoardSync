import { lazy } from 'react';

// Componentes críticos (carregados imediatamente)
export { default as Header } from '../components/Header/Header';
export { default as Column } from '../components/Column/ColumnOptimized';
export { default as Card } from '../components/Card/Card';
export { default as Login } from '../components/Login/Login';

// Componentes secundários (lazy loading)
export const NewCardModal = lazy(() => import('../components/NewCardModal/NewCardModal'));
export const CategoryFilter = lazy(() => import('../components/CategoryFilter/CategoryFilter'));
export const DueDateFilter = lazy(() => import('../components/DueDateFilter/DueDateFilter'));
export const BlockCardModal = lazy(() => import('../components/BlockCardModal/BlockCardModal'));
export const LabelManager = lazy(() => import('../components/LabelManager/LabelManager'));
export const UserManager = lazy(() => import('../components/UserManager/UserManager'));
export const ThemeSelector = lazy(() => import('../components/ThemeSelector/ThemeSelector'));
export const ActivityLog = lazy(() => import('../components/ActivityLog/ActivityLog'));
export const CommentsModal = lazy(() => import('../components/CommentsModal/CommentsModal'));
export const CardDetailView = lazy(() => import('../components/CardDetailView/CardDetailView'));
export const TeamChat = lazy(() => import('../components/TeamChat/TeamChat'));
export const Register = lazy(() => import('../components/Register/Register'));
export const DataManager = lazy(() => import('../components/DataManager/DataManager'));

// Componente de fallback para loading
export const LoadingFallback = ({ message = 'Carregando...' }) => (
  <div className="loading-fallback">
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
    <p>{message}</p>
  </div>
);
