import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from './Card';
import { Alert } from '../Alert/Alert';

describe('Card e Alert', () => {
  it('renderiza conteúdo do card', () => { render(<Card>Projeto</Card>); expect(screen.getByText('Projeto')).toBeVisible(); });
  it('expõe a severidade do alerta', () => { render(<Alert severity="error">Falha</Alert>); expect(screen.getByRole('alert')).toHaveTextContent('Falha'); });
});
