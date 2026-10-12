import { describe, expect, it } from 'vitest';
import { formatBrazilianPhone } from './PublicUser.formatters';

describe('formatBrazilianPhone', () => {
  it('formata telefone celular com DDD', () => {
    expect(formatBrazilianPhone('31999999999')).toBe('(31) 99999-9999');
  });

  it('limita o valor aos onze dígitos e aceita caracteres já formatados', () => {
    expect(formatBrazilianPhone('(31) 99999-99991234')).toBe('(31) 99999-9999');
  });
});
