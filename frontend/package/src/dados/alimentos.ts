export type FonteAlimento = 'TACO' | 'Tucunduva' | 'Personalizado';
export type ValorMicronutriente = number | 'Tr' | null;

export const fontesDadosAlimentos = {
    TACO: {
        nome: 'Tabela Brasileira de Composição de Alimentos (TACO)',
        versao: '4ª edição revisada e ampliada, 2011',
        instituicao: 'NEPA/UNICAMP'
    },
    Tucunduva: {
        nome: 'Tabela de Composição de Alimentos: suporte para decisão nutricional',
        versao: '2ª edição, 2002',
        instituicao: 'Sonia Tucunduva Philippi · Editora Gráfica Coronário'
    }
} as const;

export interface Micronutrientes {
    retinol_ug: ValorMicronutriente;
    vitamina_a_re_ug: ValorMicronutriente;
    vitamina_a_rae_ug: ValorMicronutriente;
    vitamina_c_mg: ValorMicronutriente;
    tiamina_mg: ValorMicronutriente;
    riboflavina_mg: ValorMicronutriente;
    piridoxina_mg: ValorMicronutriente;
    vitamina_b12_ug: ValorMicronutriente;
    vitamina_d_ug: ValorMicronutriente;
    niacina_mg: ValorMicronutriente;
    folato_ug: ValorMicronutriente;
    acido_pantotenico_mg: ValorMicronutriente;
    vitamina_e_mg: ValorMicronutriente;
    iodo_ug: ValorMicronutriente;
    sodio_mg: ValorMicronutriente;
    calcio_mg: ValorMicronutriente;
    magnesio_mg: ValorMicronutriente;
    zinco_mg: ValorMicronutriente;
    manganes_mg: ValorMicronutriente;
    potassio_mg: ValorMicronutriente;
    fosforo_mg: ValorMicronutriente;
    ferro_mg: ValorMicronutriente;
    cobre_mg: ValorMicronutriente;
    selenio_ug: ValorMicronutriente;
}

export interface Alimento {
    id: string;
    nome: string;
    nome_cientifico?: string | null;
    grupo: string | null;
    fonte: FonteAlimento;
    kcal: number | null;
    proteina_g: number | null;
    lipideos_g: number | null;
    carboidrato_g: number | null;
    fibra_g: number | null;
    micronutrientes?: Micronutrientes;
}

interface RegistroTucunduva {
    id: number;
    nome: string;
    nome_cientifico?: string | null;
    grupo: string | null;
    kcal: number | null;
    proteina_g: number | null;
    lipideos_g: number | null;
    carboidrato_g: number | null;
    fibra_g: number | null;
    micronutrientes?: Micronutrientes;
}

interface RegistroTaco {
    id: number;
    nome: string;
    categoria: string | null;
    nome_cientifico: string | null;
    macros: {
        energia_kcal: number | null;
        proteina_g: number | null;
        lipideos_g: number | null;
        carboidrato_g: number | null;
        fibra_alimentar_g: number | null;
    };
    minerais: {
        calcio_mg: number | null;
        magnesio_mg: number | null;
        manganes_mg: number | null;
        fosforo_mg: number | null;
        ferro_mg: number | null;
        sodio_mg: number | null;
        potassio_mg: number | null;
        cobre_mg: number | null;
        zinco_mg: number | null;
    };
    vitaminas: {
        retinol_ug: number | null;
        re_ug: number | null;
        rae_ug: number | null;
        tiamina_mg: number | null;
        riboflavina_mg: number | null;
        piridoxina_mg: number | null;
        niacina_mg: number | null;
        vitamina_c_mg: number | null;
    };
    flags: Partial<Record<string, string>>;
}

function valorTaco(
    valor: number | null,
    flags: Partial<Record<string, string>>,
    chave: string
): ValorMicronutriente {
    return flags[chave] === 'Tr' ? 'Tr' : valor;
}

function normalizarTaco(registros: RegistroTaco[]): Alimento[] {
    return registros.map((registro) => ({
        id: `taco-${registro.id}`,
        nome: registro.nome,
        nome_cientifico: registro.nome_cientifico,
        grupo: registro.categoria,
        fonte: 'TACO',
        kcal: registro.macros.energia_kcal,
        proteina_g: registro.macros.proteina_g,
        lipideos_g: registro.macros.lipideos_g,
        carboidrato_g: registro.macros.carboidrato_g,
        fibra_g: registro.macros.fibra_alimentar_g,
        micronutrientes: {
            retinol_ug: valorTaco(registro.vitaminas.retinol_ug, registro.flags, 'retinol_ug'),
            vitamina_a_re_ug: valorTaco(registro.vitaminas.re_ug, registro.flags, 're_ug'),
            vitamina_a_rae_ug: valorTaco(registro.vitaminas.rae_ug, registro.flags, 'rae_ug'),
            vitamina_c_mg: valorTaco(registro.vitaminas.vitamina_c_mg, registro.flags, 'vitamina_c_mg'),
            tiamina_mg: valorTaco(registro.vitaminas.tiamina_mg, registro.flags, 'tiamina_mg'),
            riboflavina_mg: valorTaco(registro.vitaminas.riboflavina_mg, registro.flags, 'riboflavina_mg'),
            piridoxina_mg: valorTaco(registro.vitaminas.piridoxina_mg, registro.flags, 'piridoxina_mg'),
            vitamina_b12_ug: null,
            vitamina_d_ug: null,
            niacina_mg: valorTaco(registro.vitaminas.niacina_mg, registro.flags, 'niacina_mg'),
            folato_ug: null,
            acido_pantotenico_mg: null,
            vitamina_e_mg: null,
            iodo_ug: null,
            sodio_mg: valorTaco(registro.minerais.sodio_mg, registro.flags, 'sodio_mg'),
            calcio_mg: valorTaco(registro.minerais.calcio_mg, registro.flags, 'calcio_mg'),
            magnesio_mg: valorTaco(registro.minerais.magnesio_mg, registro.flags, 'magnesio_mg'),
            zinco_mg: valorTaco(registro.minerais.zinco_mg, registro.flags, 'zinco_mg'),
            manganes_mg: valorTaco(registro.minerais.manganes_mg, registro.flags, 'manganes_mg'),
            potassio_mg: valorTaco(registro.minerais.potassio_mg, registro.flags, 'potassio_mg'),
            fosforo_mg: valorTaco(registro.minerais.fosforo_mg, registro.flags, 'fosforo_mg'),
            ferro_mg: valorTaco(registro.minerais.ferro_mg, registro.flags, 'ferro_mg'),
            cobre_mg: valorTaco(registro.minerais.cobre_mg, registro.flags, 'cobre_mg'),
            selenio_ug: null
        }
    }));
}

function normalizarTucunduva(
    registros: RegistroTucunduva[],
    fonte: Exclude<FonteAlimento, 'Personalizado'>
): Alimento[] {
    return registros.map((registro) => ({
        id: `${fonte.toLocaleLowerCase('pt-BR')}-${registro.id}`,
        nome: registro.nome,
        nome_cientifico: registro.nome_cientifico,
        grupo: registro.grupo,
        fonte,
        kcal: registro.kcal,
        proteina_g: registro.proteina_g,
        lipideos_g: registro.lipideos_g,
        carboidrato_g: registro.carboidrato_g,
        fibra_g: registro.fibra_g,
        micronutrientes: registro.micronutrientes
    }));
}

let alimentosBase: Alimento[] | undefined;
let alimentosPorNome: Map<string, Alimento> | undefined;
let carregamentoAlimentos: Promise<Alimento[]> | undefined;

export function obterAlimentoBasePorNome(nome: string): Alimento | undefined {
    return alimentosPorNome?.get(nome);
}

export function carregarAlimentosBase(): Promise<Alimento[]> {
    if (alimentosBase) {
        return Promise.resolve(alimentosBase);
    }

    if (!carregamentoAlimentos) {
        carregamentoAlimentos = Promise.all([
            import('@/data/alimentos/taco.json'),
            import('@/data/alimentos/tucunduva.json')
        ])
            .then(([tabelaTaco, tabelaTucunduva]) => {
                const registrosTaco = tabelaTaco.default as { alimentos: RegistroTaco[] };
                const registrosTucunduva = tabelaTucunduva.default as RegistroTucunduva[];

                alimentosBase = [
                    ...normalizarTaco(registrosTaco.alimentos),
                    ...normalizarTucunduva(registrosTucunduva, 'Tucunduva')
                ];
                alimentosPorNome = new Map();
                for (const alimento of alimentosBase) {
                    if (!alimentosPorNome.has(alimento.nome)) {
                        alimentosPorNome.set(alimento.nome, alimento);
                    }
                }
                return alimentosBase;
            })
            .catch((falha: unknown) => {
                carregamentoAlimentos = undefined;
                throw falha;
            });
    }

    return carregamentoAlimentos;
}
