import type { Alimento, FonteAlimento } from './alimentos';

export interface AlimentoSubstituto extends Alimento {
    quantidadeGramas: number;
}

export interface AlimentoNoPlano extends Alimento {
    quantidadeGramas: number;
    substituicoes?: AlimentoSubstituto[];
    descricaoSubstituicoes?: string;
}

interface AlimentoNoPlanoLegado extends Omit<AlimentoNoPlano, 'substituicoes'> {
    substituicoes?: AlimentoSubstituto[] | string;
    descricaoSubstituicoes?: string;
}

export interface RefeicaoPlano {
    nome: string;
    horario?: string;
    alimentos: AlimentoNoPlano[];
    substituicoes?: string;
    observacoes?: string;
}

interface RefeicaoPlanoLegada extends Omit<RefeicaoPlano, 'alimentos'> {
    alimentos: AlimentoNoPlanoLegado[];
}

export interface PlanoAlimentarSalvo {
    id: number;
    paciente: string;
    objetivo: string;
    nutricionista: string;
    ajusteCaloricoEER?: number;
    calorias: number | null;
    refeicoes: number;
    atualizadoEm: string;
    status: 'Ativo' | 'Rascunho' | 'Concluído';
    itens: RefeicaoPlano[];
}

const CHAVE_PLANOS = 'nutriplanner:planos-alimentares';

export function lerPlanosSalvos(): PlanoAlimentarSalvo[] {
    const valorSalvo = localStorage.getItem(CHAVE_PLANOS);

    if (!valorSalvo) {
        return [];
    }

    const dados: unknown = JSON.parse(valorSalvo);

    if (!Array.isArray(dados)) {
        throw new Error('Os planos salvos estão em um formato inválido.');
    }

    // Planos salvos antes da adição do campo "nutricionista" não o possuem no localStorage.
    return (dados as PlanoAlimentarSalvo[]).map((plano) => ({
        ...plano,
        nutricionista: plano.nutricionista ?? '',
        ajusteCaloricoEER: plano.ajusteCaloricoEER ?? 0,
        itens: plano.itens.map(normalizarRefeicaoPlano)
    }));
}

export function normalizarRefeicaoPlano(refeicao: RefeicaoPlano | RefeicaoPlanoLegada): RefeicaoPlano {
    const substituicaoAntiga = refeicao.substituicoes?.trim() ?? '';
    const dadosRefeicao = { ...refeicao };
    delete dadosRefeicao.substituicoes;

    return {
        ...dadosRefeicao,
        observacoes: refeicao.observacoes ?? '',
        alimentos: refeicao.alimentos.map((alimento, indice) => {
            const substituicoes = alimento.substituicoes;
            const dadosAlimento = { ...alimento };
            delete dadosAlimento.substituicoes;
            const descricaoLegada =
                alimento.descricaoSubstituicoes?.trim() ||
                (typeof substituicoes === 'string'
                    ? substituicoes
                    : indice === 0
                      ? substituicaoAntiga
                      : '');

            return {
                ...dadosAlimento,
                substituicoes: Array.isArray(substituicoes) ? substituicoes : [],
                descricaoSubstituicoes: descricaoLegada
            };
        })
    };
}

export function salvarPlano(plano: PlanoAlimentarSalvo): void {
    const planos = lerPlanosSalvos();
    planos.unshift(plano);
    localStorage.setItem(CHAVE_PLANOS, JSON.stringify(planos));
}

export function atualizarPlano(planoAtualizado: PlanoAlimentarSalvo): void {
    const planos = lerPlanosSalvos();
    const indice = planos.findIndex((plano) => plano.id === planoAtualizado.id);

    if (indice === -1) {
        throw new Error('O plano que você tentou atualizar não foi encontrado.');
    }

    planos[indice] = planoAtualizado;
    localStorage.setItem(CHAVE_PLANOS, JSON.stringify(planos));
}

export function criarAlimentoPersonalizado(
    id: string,
    nome: string,
    nutrientes: Pick<Alimento, 'kcal' | 'proteina_g' | 'lipideos_g' | 'carboidrato_g' | 'fibra_g'>
): Alimento {
    const fonte: FonteAlimento = 'Personalizado';

    return {
        id,
        nome,
        grupo: 'Alimento personalizado',
        fonte,
        ...nutrientes
    };
}
