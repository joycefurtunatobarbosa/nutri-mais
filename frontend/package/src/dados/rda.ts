import dadosRdaJson from '@/data/DRI/DRIs_RDA.json';
import dadosUlJson from '@/data/DRI/UL.json';
import type { Micronutrientes } from './alimentos';
import { calcularIdadeEmMeses, type GrupoRDA, type Paciente } from './pacientes';

export type TipoReferencia = 'RDA' | 'AI' | 'AMDR' | 'UL';

export interface ReferenciaNutricional {
    valor?: number;
    minimo?: number;
    maximo?: number;
    tipo: TipoReferencia;
    unidade: string;
    legenda?: string;
}

interface ValorRDA {
    valor: number | null;
    tipo: string;
    unidade: string;
    legenda?: string;
}

interface FaixaAMDR {
    min: number;
    max: number;
    unidade: string;
}

interface LinhaRDA {
    grupo: GrupoRDA;
    faixa_etaria: string;
    nutrientes: Record<string, ValorRDA>;
}

interface LinhaUL {
    grupo: GrupoRDA;
    faixa_etaria: string;
    nutrientes: Record<string, ValorRDA>;
}

interface DadosRDA {
    legenda: {
        RDA: string;
        AI: string;
    };
    pagina_2_vitaminas: { dados: LinhaRDA[] };
    pagina_3_elementos: { dados: LinhaRDA[] };
    pagina_4_agua_e_macronutrientes: { dados: LinhaRDA[] };
    pagina_5_AMDR: { dados: Record<string, Record<string, FaixaAMDR>> };
}

interface DadosUL {
    legenda: {
        UL: string;
    };
    pagina_7_vitaminas: { dados: LinhaUL[] };
    pagina_8_elementos: { dados: LinhaUL[] };
}

type PacienteRDA = Pick<Paciente, 'dataNascimento' | 'grupo' | 'sexo'>;

const dadosRda = dadosRdaJson as unknown as DadosRDA;
const dadosUl = dadosUlJson as unknown as DadosUL;

const gruposDeDadosRDA = [
    ...dadosRda.pagina_2_vitaminas.dados,
    ...dadosRda.pagina_3_elementos.dados,
    ...dadosRda.pagina_4_agua_e_macronutrientes.dados
];

const gruposDeDadosUL = [
    ...dadosUl.pagina_7_vitaminas.dados,
    ...dadosUl.pagina_8_elementos.dados
];

const nomesNutrientes: Partial<Record<keyof Micronutrientes, string>> = {
    vitamina_a_rae_ug: 'Vitamin A',
    vitamina_c_mg: 'Vitamin C',
    tiamina_mg: 'Thiamin',
    riboflavina_mg: 'Riboflavin',
    piridoxina_mg: 'Vitamin B6',
    vitamina_b12_ug: 'Vitamin B12',
    vitamina_d_ug: 'Vitamin D',
    niacina_mg: 'Niacin',
    folato_ug: 'Folate',
    acido_pantotenico_mg: 'Pantothenic Acid',
    vitamina_e_mg: 'Vitamin E',
    iodo_ug: 'Iodine',
    sodio_mg: 'Sodium',
    calcio_mg: 'Calcium',
    magnesio_mg: 'Magnesium',
    zinco_mg: 'Zinc',
    manganes_mg: 'Manganese',
    potassio_mg: 'Potassium',
    fosforo_mg: 'Phosphorus',
    ferro_mg: 'Iron',
    cobre_mg: 'Copper',
    selenio_ug: 'Selenium'
};

function obterFaixaEtariaRDA(meses: number): string {
    if (meses < 6) return '0 to 6 mo';
    if (meses < 12) return '6 to 12 mo';
    if (meses < 48) return '1–3 y';
    if (meses < 108) return '4–8 y';
    if (meses < 168) return '9–13 y';
    if (meses < 228) return '14–18 y';
    if (meses < 372) return '19–30 y';
    if (meses < 612) return '31–50 y';
    if (meses < 852) return '51–70 y';
    return '> 70 y';
}

function normalizarChave(valor: string): string {
    return valor
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[–−—]/g, '-')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('pt-BR');
}

function normalizarFaixaEtaria(faixaEtaria: string): string {
    return normalizarChave(faixaEtaria).replace(/\s*(?:y|years?)$/, '');
}

function normalizarGrupoRDA(grupo: string | null, sexo: Paciente['sexo']): GrupoRDA | null {
    if (grupo) {
        const chave = normalizarChave(grupo);
        const grupos: Record<string, GrupoRDA> = {
            infants: 'Infants',
            infant: 'Infants',
            lactentes: 'Infants',
            children: 'Children',
            child: 'Children',
            criancas: 'Children',
            males: 'Males',
            male: 'Males',
            homens: 'Males',
            masculino: 'Males',
            females: 'Females',
            female: 'Females',
            mulheres: 'Females',
            feminino: 'Females',
            pregnancy: 'Pregnancy',
            gestante: 'Pregnancy',
            gestantes: 'Pregnancy',
            lactation: 'Lactation',
            lactante: 'Lactation',
            lactantes: 'Lactation'
        };
        if (grupos[chave]) {
            return grupos[chave];
        }
    }

    if (sexo === 'Feminino') return 'Females';
    if (sexo === 'Masculino') return 'Males';
    return null;
}

function obterGrupoPaciente(paciente: PacienteRDA): GrupoRDA | null {
    const meses = calcularIdadeEmMeses(paciente.dataNascimento);
    if (meses === null) {
        return null;
    }

    return meses < 12
        ? 'Infants'
        : meses < 108
          ? 'Children'
          : normalizarGrupoRDA(paciente.grupo, paciente.sexo);
}

export function obterGrupoReferenciaRDA(paciente: PacienteRDA | null): GrupoRDA | null {
    return paciente ? obterGrupoPaciente(paciente) : null;
}

function obterLinhasRDA(paciente: PacienteRDA | null): LinhaRDA[] {
    if (!paciente) {
        return [];
    }

    const meses = calcularIdadeEmMeses(paciente.dataNascimento);
    if (meses === null) {
        return [];
    }

    const grupo = obterGrupoPaciente(paciente);
    if (!grupo) {
        return [];
    }

    const faixaEtaria = obterFaixaEtariaRDA(meses);
    return gruposDeDadosRDA.filter(
        (item) =>
            normalizarChave(item.grupo) === normalizarChave(grupo) &&
            normalizarFaixaEtaria(item.faixa_etaria) === normalizarFaixaEtaria(faixaEtaria)
    );
}

function converterValorRDA(valor: ValorRDA | undefined): ReferenciaNutricional | null {
    if (!valor || typeof valor.valor !== 'number' || (valor.tipo !== 'RDA' && valor.tipo !== 'AI')) {
        return null;
    }

    return {
        valor: valor.valor,
        tipo: valor.tipo,
        unidade: valor.unidade,
        legenda: valor.legenda
    };
}

function obterAMDR(nomeNutriente: string, meses: number): ReferenciaNutricional | null {
    const faixa =
        meses < 48
            ? 'Children 1–3 y'
            : meses < 228
              ? 'Children 4–18 y'
              : 'Adults';
    const intervalo = dadosRda.pagina_5_AMDR.dados[nomeNutriente]?.[faixa];

    return intervalo
        ? {
              minimo: intervalo.min,
              maximo: intervalo.max,
              tipo: 'AMDR',
              unidade: intervalo.unidade
          }
        : null;
}

export function obterReferenciaAMDR(
    paciente: Paciente | null,
    nomeNutriente: string
): ReferenciaNutricional | null {
    if (!paciente) {
        return null;
    }

    const idadeEmMeses = calcularIdadeEmMeses(paciente.dataNascimento);
    return idadeEmMeses === null ? null : obterAMDR(nomeNutriente, idadeEmMeses);
}

function obterUL(
    grupo: GrupoRDA,
    faixaEtaria: string,
    nomeNutriente: string
): ReferenciaNutricional | null {
    const valor = gruposDeDadosUL.filter(
        (item) =>
            normalizarChave(item.grupo) === normalizarChave(grupo) &&
            normalizarFaixaEtaria(item.faixa_etaria) === normalizarFaixaEtaria(faixaEtaria)
    )
        .map((item) => item.nutrientes[nomeNutriente])
        .find((item) => item?.tipo === 'UL' && typeof item.valor === 'number' && Boolean(item.unidade));
    if (!valor || valor.tipo !== 'UL' || typeof valor.valor !== 'number' || !valor.unidade) {
        return null;
    }

    return {
        valor: valor.valor,
        tipo: 'UL',
        unidade: valor.unidade,
        legenda: valor.legenda
    };
}

export function obterReferenciaNutriente(
    paciente: PacienteRDA | null,
    nomeNutriente: string,
    meses?: number
): ReferenciaNutricional | null {
    if (!paciente) {
        return null;
    }

    const idadeEmMeses = meses ?? calcularIdadeEmMeses(paciente.dataNascimento);
    const grupo = obterGrupoPaciente(paciente);
    if (idadeEmMeses === null || !grupo) {
        return null;
    }

    const rda = obterLinhasRDA(paciente)
        .map((linha) => converterValorRDA(linha.nutrientes[nomeNutriente]))
        .find((referencia) => referencia !== null) ?? null;
    if (rda) {
        return rda;
    }

    const amdr = obterAMDR(nomeNutriente, idadeEmMeses);
    if (amdr) {
        return amdr;
    }

    return obterUL(grupo, obterFaixaEtariaRDA(idadeEmMeses), nomeNutriente);
}

export function obterReferenciasNutrientes(paciente: PacienteRDA | null) {
    if (!paciente) {
        return null;
    }

    const meses = calcularIdadeEmMeses(paciente.dataNascimento);
    if (meses === null || !obterGrupoPaciente(paciente)) {
        return null;
    }

    const referencias: Partial<Record<keyof Micronutrientes, ReferenciaNutricional>> = {};
    for (const [chave, nomeNutriente] of Object.entries(nomesNutrientes) as [keyof Micronutrientes, string][]) {
        const referencia = obterReferenciaNutriente(paciente, nomeNutriente, meses);
        if (referencia) {
            referencias[chave] = referencia;
        }
    }

    return referencias;
}

export const legendasReferencias = {
    RDA: {
        descricao: 'Recommended Dietary Allowance (Ingestão Dietética Recomendada): ingestão diária que atende às necessidades de 97–98% das pessoas saudáveis do grupo; serve como referência de adequação.',
        fonte: 'Food and Nutrition Board, Institute of Medicine, National Academies. Dietary Reference Intakes (DRIs), páginas 2–4.',
        url: 'https://nap.nationalacademies.org/catalog/11537/dietary-reference-intakes-the-essential-guide-to-nutrient-requirements'
    },
    AI: {
        descricao: 'Adequate Intake (Ingestão Adequada): referência usada quando não há dados suficientes para estabelecer uma RDA; estima-se que seja adequada para pessoas saudáveis. O * identifica valores AI.',
        fonte: 'Food and Nutrition Board, Institute of Medicine, National Academies. Dietary Reference Intakes (DRIs), páginas 2–4.',
        url: 'https://nap.nationalacademies.org/catalog/11537/dietary-reference-intakes-the-essential-guide-to-nutrient-requirements'
    },
    AMDR: {
        descricao: 'Acceptable Macronutrient Distribution Range (Faixa de Distribuição Aceitável de Macronutrientes): intervalo da energia diária que deve vir de cada macronutriente; orienta uma distribuição associada à adequação nutricional e à saúde.',
        fonte: 'Food and Nutrition Board, Institute of Medicine, National Academies. DRIs for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids (2002/2005), página 6.',
        url: 'https://nap.nationalacademies.org/catalog/10490/dietary-reference-intakes-for-energy-carbohydrate-fiber-fat-fatty-acids-cholesterol-protein-and-amino-acids'
    },
    UL: {
        descricao: 'Tolerable Upper Intake Level (Limite Superior Tolerável de Ingestão): maior ingestão diária que provavelmente não oferece risco à maioria das pessoas. Serve como limite de segurança, não como meta de consumo.',
        fonte: 'Food and Nutrition Board, Institute of Medicine, National Academies. Dietary Reference Intakes (DRIs), páginas 7–8.',
        url: 'https://nap.nationalacademies.org/catalog/11537/dietary-reference-intakes-the-essential-guide-to-nutrient-requirements'
    }
};
