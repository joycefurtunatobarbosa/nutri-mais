import { obterAlimentoBasePorNome } from './alimentos';
import type { AlimentoNoPlano, RefeicaoPlano } from './planosSalvos';

export type StatusPlanoMock = 'Ativo' | 'Rascunho' | 'Concluído';

export interface PlanoMock {
    id: number;
    paciente: string;
    objetivo: string;
    nutricionista: string;
    calorias: number | null;
    refeicoes: number;
    atualizadoEm: string;
    status: StatusPlanoMock;
}

export interface PlanoMockComRefeicoes extends PlanoMock {
    itens: RefeicaoPlano[];
}

interface AlimentoMock extends AlimentoNoPlano {
    referenciaMicronutrientes?: string;
}

interface RefeicaoMock extends Omit<RefeicaoPlano, 'alimentos'> {
    alimentos: AlimentoMock[];
}

const NUTRICIONISTA_PADRAO = 'Dra. Camila Rodrigues';

export const planosMock: PlanoMock[] = [
    { id: 1, paciente: 'Mariana Costa', objetivo: 'Emagrecimento saudável', nutricionista: NUTRICIONISTA_PADRAO, calorias: 1650, refeicoes: 5, atualizadoEm: 'Hoje', status: 'Ativo' },
    { id: 2, paciente: 'Pedro Henrique', objetivo: 'Ganho de massa muscular', nutricionista: NUTRICIONISTA_PADRAO, calorias: 2450, refeicoes: 6, atualizadoEm: 'Ontem', status: 'Ativo' },
    { id: 3, paciente: 'Camila Oliveira', objetivo: 'Reeducação alimentar', nutricionista: NUTRICIONISTA_PADRAO, calorias: 1800, refeicoes: 5, atualizadoEm: '20 out, 2026', status: 'Rascunho' },
    { id: 4, paciente: 'Rafael Santos', objetivo: 'Controle glicêmico', nutricionista: NUTRICIONISTA_PADRAO, calorias: 1900, refeicoes: 6, atualizadoEm: '18 out, 2026', status: 'Ativo' },
    { id: 5, paciente: 'Beatriz Almeida', objetivo: 'Emagrecimento saudável', nutricionista: NUTRICIONISTA_PADRAO, calorias: 1500, refeicoes: 5, atualizadoEm: '15 out, 2026', status: 'Concluído' },
    { id: 6, paciente: 'Lucas Ferreira', objetivo: 'Melhora da performance', nutricionista: NUTRICIONISTA_PADRAO, calorias: 2200, refeicoes: 6, atualizadoEm: '12 out, 2026', status: 'Ativo' },
    { id: 7, paciente: 'Fernanda Lima', objetivo: 'Saúde intestinal', nutricionista: NUTRICIONISTA_PADRAO, calorias: 1750, refeicoes: 5, atualizadoEm: '10 out, 2026', status: 'Rascunho' },
    { id: 8, paciente: 'Gabriel Souza', objetivo: 'Ganho de massa muscular', nutricionista: NUTRICIONISTA_PADRAO, calorias: 2600, refeicoes: 6, atualizadoEm: '05 out, 2026', status: 'Concluído' }
];

export function gerarCodigoHashPlano(tipo: 'mock' | 'salvo', id: number, paciente: string): string {
    const entrada = `${id}:${paciente}`;
    let hash = 2166136261;

    for (let indice = 0; indice < entrada.length; indice += 1) {
        hash = Math.imul(hash ^ entrada.charCodeAt(indice), 16777619);
    }

    const hashHexadecimal = (hash >>> 0).toString(16);
    const hashCompleto = `00000000${hashHexadecimal}`.slice(-8);

    return `${tipo === 'mock' ? 'm' : 'p'}-${hashCompleto}`;
}

function criarAlimentoMock(
    id: string,
    nome: string,
    kcal: number,
    proteina: number,
    gordura: number,
    carboidrato: number,
    fibra: number,
    quantidadeGramas: number,
    referenciaMicronutrientes?: string
): AlimentoMock {
    return {
        id,
        nome,
        grupo: 'Exemplo demonstrativo',
        fonte: 'TACO',
        kcal,
        proteina_g: proteina,
        lipideos_g: gordura,
        carboidrato_g: carboidrato,
        fibra_g: fibra,
        quantidadeGramas,
        referenciaMicronutrientes
    };
}

const alimentosMock = {
    aveia: criarAlimentoMock('aveia-mock', 'Aveia em flocos', 394, 13.9, 8.5, 66.6, 9.1, 30, 'Aveia, flocos, crua'),
    banana: criarAlimentoMock('banana-mock', 'Banana-prata', 98, 1.3, 0.1, 26, 2, 80, 'Banana, prata, crua'),
    ovo: criarAlimentoMock(
        'ovo-mock',
        'Ovo de galinha cozido',
        146,
        13.3,
        9.5,
        0.6,
        0,
        100,
        'Ovo, de galinha, inteiro, cozido/10minutos'
    ),
    iogurte: criarAlimentoMock('iogurte-mock', 'Iogurte natural', 51, 4.1, 3, 1.9, 0, 170, 'Iogurte, natural'),
    maca: criarAlimentoMock('maca-mock', 'Maçã com casca', 56, 0.3, 0, 15.2, 1.3, 130, 'Maçã, Fuji, com casca, crua'),
    castanhas: criarAlimentoMock(
        'castanhas-mock',
        'Castanha-do-pará',
        643,
        14.5,
        63.5,
        15.1,
        7.9,
        15,
        'Castanha-do-Brasil, crua'
    ),
    frango: criarAlimentoMock(
        'frango-mock',
        'Peito de frango grelhado',
        159,
        32,
        2.5,
        0,
        0,
        130,
        'Frango, peito, sem pele, grelhado'
    ),
    arroz: criarAlimentoMock(
        'arroz-mock',
        'Arroz integral cozido',
        124,
        2.6,
        1,
        25.8,
        2.7,
        100,
        'Arroz, integral, cozido'
    ),
    feijao: criarAlimentoMock(
        'feijao-mock',
        'Feijão carioca cozido',
        76,
        4.8,
        0.5,
        13.6,
        8.5,
        90,
        'Feijão, carioca, cozido'
    ),
    salada: criarAlimentoMock('salada-mock', 'Salada de folhas e tomate', 20, 1.2, 0.2, 3.5, 1.5, 100),
    pera: criarAlimentoMock('pera-mock', 'Pera', 53, 0.6, 0.1, 14, 3, 130, 'Pêra, Williams, crua'),
    queijo: criarAlimentoMock(
        'queijo-mock',
        'Queijo minas frescal',
        264,
        17.4,
        20.2,
        3.2,
        0,
        30,
        'Queijo, minas, frescal'
    ),
    peixe: criarAlimentoMock('peixe-mock', 'Filé de tilápia grelhado', 128, 26.2, 2.3, 0, 0, 140),
    batata: criarAlimentoMock(
        'batata-mock',
        'Batata-doce cozida',
        77,
        0.6,
        0.1,
        18.4,
        2.2,
        120,
        'Batata, doce, cozida'
    ),
    abacate: criarAlimentoMock('abacate-mock', 'Abacate', 96, 1.2, 8.4, 6, 6.3, 70, 'Abacate, cru'),
    tapioca: criarAlimentoMock('tapioca-mock', 'Tapioca', 288, 0.2, 0, 71.9, 0.2, 50)
};

const cardapiosMock: RefeicaoMock[][] = [
    [
        { nome: 'Café da manhã', horario: '07:30', alimentos: [alimentosMock.aveia, alimentosMock.banana, alimentosMock.ovo] },
        { nome: 'Lanche da manhã', horario: '10:00', alimentos: [alimentosMock.iogurte, alimentosMock.maca] },
        { nome: 'Almoço', horario: '12:30', alimentos: [alimentosMock.frango, alimentosMock.arroz, alimentosMock.feijao, alimentosMock.salada] },
        { nome: 'Lanche da tarde', horario: '16:00', alimentos: [alimentosMock.queijo, alimentosMock.pera] },
        { nome: 'Jantar', horario: '19:30', alimentos: [alimentosMock.peixe, alimentosMock.batata, alimentosMock.salada] },
        { nome: 'Ceia', horario: '21:30', alimentos: [alimentosMock.iogurte, alimentosMock.castanhas] }
    ],
    [
        { nome: 'Café da manhã', horario: '07:30', alimentos: [alimentosMock.ovo, alimentosMock.tapioca, alimentosMock.abacate] },
        { nome: 'Lanche da manhã', horario: '10:00', alimentos: [alimentosMock.banana, alimentosMock.castanhas] },
        { nome: 'Almoço', horario: '12:30', alimentos: [alimentosMock.frango, alimentosMock.arroz, alimentosMock.feijao, alimentosMock.salada] },
        { nome: 'Lanche da tarde', horario: '16:00', alimentos: [alimentosMock.iogurte, alimentosMock.aveia] },
        { nome: 'Jantar', horario: '19:30', alimentos: [alimentosMock.peixe, alimentosMock.batata, alimentosMock.salada] },
        { nome: 'Ceia', horario: '21:30', alimentos: [alimentosMock.queijo, alimentosMock.pera] }
    ],
    [
        { nome: 'Café da manhã', horario: '07:30', alimentos: [alimentosMock.iogurte, alimentosMock.aveia, alimentosMock.maca] },
        { nome: 'Lanche da manhã', horario: '10:00', alimentos: [alimentosMock.ovo, alimentosMock.pera] },
        { nome: 'Almoço', horario: '12:30', alimentos: [alimentosMock.peixe, alimentosMock.arroz, alimentosMock.feijao, alimentosMock.salada] },
        { nome: 'Lanche da tarde', horario: '16:00', alimentos: [alimentosMock.tapioca, alimentosMock.queijo] },
        { nome: 'Jantar', horario: '19:30', alimentos: [alimentosMock.frango, alimentosMock.batata, alimentosMock.salada] },
        { nome: 'Ceia', horario: '21:30', alimentos: [alimentosMock.iogurte, alimentosMock.abacate] }
    ]
];

export function obterPlanoMock(id: number): PlanoMockComRefeicoes | undefined {
    const plano = planosMock.find((item) => item.id === id);

    if (!plano) {
        return undefined;
    }

    const cardapio = cardapiosMock[(id - 1) % cardapiosMock.length];

    return {
        ...plano,
        itens: cardapio.slice(0, plano.refeicoes).map((refeicao) => ({
            ...refeicao,
            alimentos: refeicao.alimentos.map((alimento) => {
                const { referenciaMicronutrientes, ...alimentoPlano } = alimento;
                const alimentoReferencia = referenciaMicronutrientes
                    ? obterAlimentoBasePorNome(referenciaMicronutrientes)
                    : undefined;

                return {
                    ...alimentoPlano,
                    micronutrientes: alimentoReferencia?.micronutrientes
                };
            })
        }))
    };
}

export function obterPlanoMockPorCodigo(codigo: string): PlanoMockComRefeicoes | undefined {
    const plano = planosMock.find(
        (item) => gerarCodigoHashPlano('mock', item.id, item.paciente) === codigo
    );

    return plano ? obterPlanoMock(plano.id) : undefined;
}
