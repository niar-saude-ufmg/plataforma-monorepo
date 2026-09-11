import CircularProgress from '@mui/material/CircularProgress'; import Skeleton from '@mui/material/Skeleton'; import Box from '@mui/material/Box';
export type LoadingProps = { label?: string; size?: number };
export function Loading({ label = 'Carregando…', size = 28 }: LoadingProps) { return <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} role="status"><CircularProgress size={size} aria-label={label} /><span>{label}</span></Box>; }
export type LoadingSkeletonProps = { lines?: number; height?: number };
export function LoadingSkeleton({ lines = 3, height = 20 }: LoadingSkeletonProps) { return <Box sx={{ display: 'grid', gap: 1, width: '100%' }} role="status" aria-label="Carregando conteúdo" aria-busy="true">{Array.from({ length: lines }, (_, index) => <Skeleton key={index} aria-hidden="true" variant="rounded" width="100%" height={height} sx={{ display: 'block', minWidth: 120 }} />)}</Box>; }
