import {
    calcularIdade,
    calcularIdadeEmMeses,
    type NivelAtividadeFisica,
    type Paciente
} from './pacientes';

type EntradaEER = Pick<
    Paciente,
    | 'dataNascimento'
    | 'sexo'
    | 'pesoKg'
    | 'alturaCm'
    | 'nivelAtividadeFisica'
    | 'estagioFisiologicoEER'
    | 'semanasGestacao'
    | 'classificacaoPesoGestacional'
>;

export interface CalculoEER {
    kcal: number;
    formula: string;
    detalhes: string;
    fonte: string;
}

interface CoeficientesEER {
    constante: number;
    idade: number;
    altura: number;
    peso: number;
}

interface AjusteEER {
    valor: number;
    descricao: string;
}

const rotulosAtividade: Record<NivelAtividadeFisica, string> = {
    'Inativo': 'Inativo',
    'Pouco ativo': 'Pouco ativo',
    'Ativo': 'Ativo',
    'Muito ativo': 'Muito ativo'
};

const equacoesAdultos: Record<'Feminino' | 'Masculino', Record<NivelAtividadeFisica, CoeficientesEER>> = {
    Feminino: {
        'Inativo': { constante: 584.9, idade: -7.01, altura: 5.72, peso: 11.71 },
        'Pouco ativo': { constante: 575.77, idade: -7.01, altura: 6.6, peso: 12.14 },
        'Ativo': { constante: 710.25, idade: -7.01, altura: 6.54, peso: 12.34 },
        'Muito ativo': { constante: 511.83, idade: -7.01, altura: 9.07, peso: 12.56 }
    },
    Masculino: {
        'Inativo': { constante: 753.07, idade: -10.83, altura: 6.5, peso: 14.1 },
        'Pouco ativo': { constante: 581.47, idade: -10.83, altura: 8.3, peso: 14.94 },
        'Ativo': { constante: 1004.82, idade: -10.83, altura: 6.52, peso: 15.91 },
        'Muito ativo': { constante: -517.88, idade: -10.83, altura: 15.61, peso: 19.11 }
    }
};

function formatarNumero(valor: number, casasDecimais = 2): string {
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: casasDecimais });
}

function formatarTermo(coeficiente: number, valor: number, unidade: string): string {
    const sinal = coeficiente < 0 ? ' − ' : ' + ';
    const casasDecimais = unidade === 'anos' ? 6 : 2;
    return `${sinal}(${formatarNumero(Math.abs(coeficiente))} × ${formatarNumero(valor, casasDecimais)} ${unidade})`;
}

function montarCalculo(
    constante: number,
    termos: { coeficiente: number; valor: number; unidade: string }[],
    detalhes: string,
    fonte: string,
    ajustes: AjusteEER[] = []
): CalculoEER {
    const total = constante +
        termos.reduce((soma, termo) => soma + termo.coeficiente * termo.valor, 0) +
        ajustes.reduce((soma, ajuste) => soma + ajuste.valor, 0);
    const expressao = termos.map((termo) =>
        formatarTermo(termo.coeficiente, termo.valor, termo.unidade)
    ).join('');
    const expressaoAjustes = ajustes.map((ajuste) =>
        ` ${ajuste.valor < 0 ? '−' : '+'} ${formatarNumero(Math.abs(ajuste.valor))} ${ajuste.descricao}`
    ).join('');

    return {
        kcal: Math.round(total),
        formula: `EER = ${formatarNumero(constante)}${expressao}${expressaoAjustes} = ${Math.round(total).toLocaleString('pt-BR')} kcal/dia`,
        detalhes,
        fonte
    };
}

function montarEquacaoAdulto(
    sexo: 'Feminino' | 'Masculino',
    atividade: NivelAtividadeFisica,
    idade: number,
    alturaCm: number,
    pesoKg: number,
    adicionais: AjusteEER[] = []
): CalculoEER {
    const equacao = equacoesAdultos[sexo][atividade];
    return montarCalculo(
        equacao.constante,
        [
            { coeficiente: equacao.idade, valor: idade, unidade: 'anos' },
            { coeficiente: equacao.altura, valor: alturaCm, unidade: 'cm' },
            { coeficiente: equacao.peso, valor: pesoKg, unidade: 'kg' }
        ],
        `${formatarNumero(idade, 6)} anos · ${sexo} · ${formatarNumero(pesoKg)} kg · ${formatarNumero(alturaCm)} cm · ${rotulosAtividade[atividade]}`,
        adicionais.length ? 'Tabela S-5, p. 6' : 'Tabela S-3, p. 5',
        adicionais
    );
}

function obterIdadeEmAnos(dataNascimento: string, hoje: Date): number | null {
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);
    const idadeCompleta = calcularIdade(dataNascimento, hoje);
    if (!ano || !mes || !dia || idadeCompleta === null) {
        return null;
    }

    const hojeUtc = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const aniversarioEsteAno = Date.UTC(hoje.getFullYear(), mes - 1, dia);
    const anoUltimoAniversario = hojeUtc >= aniversarioEsteAno
        ? hoje.getFullYear()
        : hoje.getFullYear() - 1;
    const ultimoAniversario = Date.UTC(anoUltimoAniversario, mes - 1, dia);
    const proximoAniversario = Date.UTC(anoUltimoAniversario + 1, mes - 1, dia);

    return idadeCompleta + (hojeUtc - ultimoAniversario) / (proximoAniversario - ultimoAniversario);
}

export function obterCalculoEER(paciente: EntradaEER, hoje = new Date()): CalculoEER | null {
    const idadeCompleta = calcularIdade(paciente.dataNascimento, hoje);
    const idadeEmMeses = calcularIdadeEmMeses(paciente.dataNascimento, hoje);
    const idade = obterIdadeEmAnos(paciente.dataNascimento, hoje);
    const { sexo, pesoKg, alturaCm, nivelAtividadeFisica, estagioFisiologicoEER } = paciente;

    if (
        idadeCompleta === null ||
        idadeEmMeses === null ||
        idade === null ||
        (sexo !== 'Feminino' && sexo !== 'Masculino') ||
        pesoKg === null ||
        alturaCm === null ||
        pesoKg <= 0 ||
        alturaCm <= 0
    ) {
        return null;
    }

    if (estagioFisiologicoEER === 'Gestação' && sexo !== 'Feminino') {
        return null;
    }

    if (estagioFisiologicoEER === 'Gestação') {
        const semanas = paciente.semanasGestacao;
        if (idadeCompleta < 19 || semanas === null || semanas < 1 || semanas > 42) {
            return null;
        }

        if (semanas >= 14) {
            if (!nivelAtividadeFisica || !paciente.classificacaoPesoGestacional) {
                return null;
            }

            const deposicao: Record<NonNullable<Paciente['classificacaoPesoGestacional']>, number> = {
                'Baixo peso': 300,
                'Peso normal': 200,
                'Sobrepeso': 150,
                'Obesidade': -50
            };
            const coeficientes: Record<NivelAtividadeFisica, { constante: number; altura: number; peso: number }> = {
                'Inativo': { constante: 1131.2, altura: 0.34, peso: 12.15 },
                'Pouco ativo': { constante: 693.35, altura: 5.73, peso: 10.2 },
                'Ativo': { constante: -223.84, altura: 13.23, peso: 8.15 },
                'Muito ativo': { constante: -779.72, altura: 18.45, peso: 8.73 }
            };
            const coeficiente = coeficientes[nivelAtividadeFisica];
            const adicional = deposicao[paciente.classificacaoPesoGestacional];
            return montarCalculo(
                coeficiente.constante,
                [
                    { coeficiente: -2.04, valor: idade, unidade: 'anos' },
                    { coeficiente: coeficiente.altura, valor: alturaCm, unidade: 'cm' },
                    { coeficiente: coeficiente.peso, valor: pesoKg, unidade: 'kg' },
                    { coeficiente: 9.16, valor: semanas, unidade: 'semanas' }
                ],
                `${formatarNumero(idade, 6)} anos · ${sexo} · ${formatarNumero(pesoKg)} kg · ${formatarNumero(alturaCm)} cm · ${rotulosAtividade[nivelAtividadeFisica]} · ${semanas} semanas · deposição ${adicional} kcal/dia`,
                'Tabela S-4, p. 6',
                [{ valor: adicional, descricao: 'deposição energética (kcal/dia)' }]
            );
        }
    }

    const amamentacaoExclusiva = estagioFisiologicoEER === 'Aleitamento exclusivo (0–6 meses)';
    const amamentacaoParcial = estagioFisiologicoEER === 'Aleitamento parcial (7–12 meses)';
    if ((amamentacaoExclusiva || amamentacaoParcial) && sexo !== 'Feminino') {
        return null;
    }

    if (idadeCompleta < 3) {
        const faixa = idadeEmMeses < 3 ? 0 : idadeEmMeses < 6 ? 1 : 2;
        const masculino = sexo === 'Masculino';
        const crescimento = masculino
            ? [200, 50, 20][faixa]
            : faixa < 2 ? [180, 60][faixa] : idadeEmMeses < 12 ? 20 : 15;
        const constante = masculino ? -716.45 : -69.15;
        const termos = masculino
            ? [
                { coeficiente: -1, valor: idade, unidade: 'anos' },
                { coeficiente: 17.82, valor: alturaCm, unidade: 'cm' },
                { coeficiente: 15.06, valor: pesoKg, unidade: 'kg' }
            ]
            : [
                { coeficiente: 80, valor: idade, unidade: 'anos' },
                { coeficiente: 2.65, valor: alturaCm, unidade: 'cm' },
                { coeficiente: 54.15, valor: pesoKg, unidade: 'kg' }
            ];
        return montarCalculo(
            constante,
            termos,
            `${formatarNumero(idade, 6)} anos · ${sexo} · ${formatarNumero(pesoKg)} kg · ${formatarNumero(alturaCm)} cm · crescimento ${crescimento} kcal/dia`,
            'Tabela S-2, p. 4',
            [{ valor: crescimento, descricao: 'custo de crescimento (kcal/dia)' }]
        );
    }

    if (!nivelAtividadeFisica) {
        return null;
    }

    if (idadeCompleta < 19) {
        const masculino = sexo === 'Masculino';
        const coeficientes: Record<NivelAtividadeFisica, { constante: number; idade: number; altura: number; peso: number }> = masculino
            ? {
                'Inativo': { constante: -447.51, idade: 3.68, altura: 13.01, peso: 13.15 },
                'Pouco ativo': { constante: 19.12, idade: 3.68, altura: 8.62, peso: 20.28 },
                'Ativo': { constante: -388.19, idade: 3.68, altura: 12.66, peso: 20.46 },
                'Muito ativo': { constante: -671.75, idade: 3.68, altura: 15.38, peso: 23.25 }
            }
            : {
                'Inativo': { constante: 55.59, idade: -22.25, altura: 8.43, peso: 17.07 },
                'Pouco ativo': { constante: -297.54, idade: -22.25, altura: 12.77, peso: 14.73 },
                'Ativo': { constante: -189.55, idade: -22.25, altura: 11.74, peso: 18.34 },
                'Muito ativo': { constante: -709.59, idade: -22.25, altura: 18.22, peso: 14.25 }
            };
        const equacao = coeficientes[nivelAtividadeFisica];
        let crescimento = 20;
        if (idadeCompleta < 14) {
            crescimento = masculino
                ? idadeCompleta < 4 ? 20 : idadeCompleta < 9 ? 15 : 25
                : idadeCompleta < 9 ? 15 : 30;
        }
        const producaoLeite = amamentacaoExclusiva ? 540 : amamentacaoParcial ? 380 : 0;
        const mobilizacao = amamentacaoExclusiva ? 140 : 0;
        const ajustes: AjusteEER[] = [{ valor: crescimento, descricao: 'custo de crescimento (kcal/dia)' }];
        if (producaoLeite) {
            ajustes.push({ valor: producaoLeite, descricao: 'produção de leite (kcal/dia)' });
        }
        if (mobilizacao) {
            ajustes.push({ valor: -mobilizacao, descricao: 'mobilização energética (kcal/dia)' });
        }
        const calculo = montarCalculo(
            equacao.constante,
            [
                { coeficiente: equacao.idade, valor: idade, unidade: 'anos' },
                { coeficiente: equacao.altura, valor: alturaCm, unidade: 'cm' },
                { coeficiente: equacao.peso, valor: pesoKg, unidade: 'kg' }
            ],
            `${formatarNumero(idade, 6)} anos · ${sexo} · ${formatarNumero(pesoKg)} kg · ${formatarNumero(alturaCm)} cm · ${rotulosAtividade[nivelAtividadeFisica]} · crescimento ${crescimento} kcal/dia${amamentacaoExclusiva || amamentacaoParcial ? ` · leite +${producaoLeite} e mobilização −${mobilizacao} kcal/dia` : ''}`,
            amamentacaoExclusiva ? 'Tabela S-5, p. 6' : amamentacaoParcial ? 'Tabela S-6, p. 7' : 'Tabela S-2, pp. 4–5',
            ajustes
        );
        return calculo;
    }

    const producaoLeite = amamentacaoExclusiva ? 540 : amamentacaoParcial ? 380 : 0;
    const mobilizacao = amamentacaoExclusiva ? 140 : 0;
    const ajustes: AjusteEER[] = [];
    if (producaoLeite) {
        ajustes.push({ valor: producaoLeite, descricao: 'produção de leite (kcal/dia)' });
    }
    if (mobilizacao) {
        ajustes.push({ valor: -mobilizacao, descricao: 'mobilização energética (kcal/dia)' });
    }
    const calculo = montarEquacaoAdulto(
        sexo,
        nivelAtividadeFisica,
        idade,
        alturaCm,
        pesoKg,
        ajustes
    );
    if (estagioFisiologicoEER === 'Gestação') {
        return {
            ...calculo,
            detalhes: `${calculo.detalhes} · 1º trimestre (equação não gestante) · ${paciente.semanasGestacao} semanas`,
            fonte: 'Tabela S-4, p. 6 (nota: 1º trimestre usa TEE não gestante; Tabela S-3, p. 5)'
        };
    }

    return {
        ...calculo,
        detalhes: `${calculo.detalhes}${amamentacaoExclusiva || amamentacaoParcial ? ` · leite +${producaoLeite}${amamentacaoExclusiva ? ' − mobilização 140' : ''} kcal/dia` : ''}`,
        fonte: amamentacaoExclusiva ? 'Tabela S-5, p. 6' : amamentacaoParcial ? 'Tabela S-6, p. 7' : calculo.fonte
    };
}
