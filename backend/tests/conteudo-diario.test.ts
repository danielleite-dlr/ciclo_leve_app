import { conteudoDoDia } from '../src/services/conteudo-diario.service';
import { NOTAS_LUTEA, NOTAS_OVULATORIA } from '../src/constants/conteudo-diario';

// Mesmo calculo de fase de CicloService.calcularFaseAtual
function fase(d: number, C: number, S: number) {
  const ov = C - 14;
  if (d <= S) return 'MENSTRUAL';
  if (d < ov - 5) return 'FOLICULAR';
  if (d <= ov + 1) return 'OVULATORIA';
  return 'LUTEA';
}

function dataMais(n: number) {
  return new Date(Date.UTC(2026, 10, 1) + n * 86400000).toISOString().slice(0, 10);
}

function ciclo(C: number, S: number, userId = 'u1') {
  return Array.from({ length: C }, (_, i) => {
    const d = i + 1;
    return { d, f: fase(d, C, S), c: conteudoDoDia({ fase: fase(d, C, S), diaCiclo: d, duracaoCiclo: C, duracaoSangramento: S, data: dataMais(i), userId })! };
  });
}

describe('conteudoDoDia', () => {
  it.each([[21, 5], [26, 5], [28, 5], [32, 6], [35, 4], [45, 7]])('ciclo de %i dias: dois dias seguidos nunca iguais', (C, S) => {
    const dias = ciclo(C, S);
    for (let i = 1; i < dias.length; i++) {
      const [a, b] = [dias[i - 1].c, dias[i].c];
      expect(b).toBeTruthy();
      expect(b.faca[0]).not.toBe(a.faca[0]);
      expect(b.faca[1]).not.toBe(a.faca[1]);
      expect(b.faca[2]).not.toBe(a.faca[2]);
      expect(b.evite).not.toEqual(a.evite);
      expect(new Set(b.evite).size).toBe(2);
    }
  });

  it('nota acompanha a fase real, inclusive em ciclo longo', () => {
    const dias = ciclo(35, 5);
    // dia 21 = ovulacao provavel (35 - 14)
    expect(dias[20].f).toBe('OVULATORIA');
    expect(dias[20].c.nota).toBe(NOTAS_OVULATORIA[5]);
    // primeiro dia da lutea e vespera da menstruacao
    expect(dias[22].c.nota).toBe(NOTAS_LUTEA[12]);
    expect(dias[34].c.nota).toBe(NOTAS_LUTEA[0]);
  });

  it('mesmo dia, mesmo conteudo; usuarias diferentes, combinacoes diferentes', () => {
    const e = { fase: 'LUTEA', diaCiclo: 20, duracaoCiclo: 28, duracaoSangramento: 5, data: '2026-11-26' };
    expect(conteudoDoDia({ ...e, userId: 'a' })).toEqual(conteudoDoDia({ ...e, userId: 'a' }));
    const outras = ['b', 'c', 'd', 'e'].map((u) => conteudoDoDia({ ...e, userId: u })!.faca.join());
    expect(new Set([conteudoDoDia({ ...e, userId: 'a' })!.faca.join(), ...outras]).size).toBeGreaterThan(1);
  });
});
