import { lerPacientes } from '@/dados/pacientes';

export type TipoAtendimento = 'Primeiro atendimento' | 'Retorno';

export const opcoesTipoAtendimento: TipoAtendimento[] = ['Primeiro atendimento', 'Retorno'];

export interface EvolucaoAtendimento {
    data: string;
    registro: string;
    assinatura: string;
}

export interface Atendimento {
    id: number;
    tipo: TipoAtendimento;
    dataAtendimento: string;
    pacienteId: number | null;
    // 1. Identificação do paciente
    nome: string;
    dataNascimento: string;
    sexo: string;
    profissao: string;
    telefone: string;
    endereco: string;
    responsavelLegal: string;
    // 2. Anamnese
    queixaPrincipal: string;
    historicoClinico: string;
    historicoAlimentar: string;
    // 3. Avaliação
    pesoKg: number | null;
    alturaM: number | null;
    circunferenciaCinturaCm: number | null;
    percentualGordura: number | null;
    massaMagra: number | null;
    dadosBioquimicos: string;
    diagnosticoNutricional: string;
    // 4. Conduta
    prescricaoDietetica: string;
    metasOrientacoes: string;
    // 5. Evolução
    evolucoes: EvolucaoAtendimento[];
    assinaturaNutricionista: string;
}

export type DadosAtendimento = Omit<Atendimento, 'id'>;

const CHAVE_ATENDIMENTOS = 'nutriplanner:atendimentos';

export function hojeISO(): string {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    return `${agora.getFullYear()}-${mes}-${dia}`;
}

export function atendimentoVazio(tipo: TipoAtendimento = 'Primeiro atendimento'): DadosAtendimento {
    return {
        tipo,
        dataAtendimento: hojeISO(),
        pacienteId: null,
        nome: '',
        dataNascimento: '',
        sexo: '',
        profissao: '',
        telefone: '',
        endereco: '',
        responsavelLegal: '',
        queixaPrincipal: '',
        historicoClinico: '',
        historicoAlimentar: '',
        pesoKg: null,
        alturaM: null,
        circunferenciaCinturaCm: null,
        percentualGordura: null,
        massaMagra: null,
        dadosBioquimicos: '',
        diagnosticoNutricional: '',
        prescricaoDietetica: '',
        metasOrientacoes: '',
        evolucoes: [{ data: '', registro: '', assinatura: '' }],
        assinaturaNutricionista: ''
    };
}

export function calcularIMC(pesoKg: number | null, alturaM: number | null): number | null {
    if (!pesoKg || !alturaM || pesoKg <= 0 || alturaM <= 0) return null;
    return Math.round((pesoKg / (alturaM * alturaM)) * 10) / 10;
}

export function lerAtendimentos(): Atendimento[] {
    try {
        const valor = localStorage.getItem(CHAVE_ATENDIMENTOS);

        // Na primeira utilização, grava atendimentos de exemplo vinculados aos pacientes de exemplo.
        if (valor === null) {
            const exemplos = gerarAtendimentosMock();
            gravar(exemplos);
            return exemplos;
        }
        const lista = valor ? JSON.parse(valor) : [];
        return Array.isArray(lista) ? lista : [];
    } catch {
        return [];
    }
}

function gravar(atendimentos: Atendimento[]): void {
    localStorage.setItem(CHAVE_ATENDIMENTOS, JSON.stringify(atendimentos));
}

export function buscarAtendimento(id: number): Atendimento | null {
    return lerAtendimentos().find((item) => item.id === id) ?? null;
}

export function criarAtendimento(dados: DadosAtendimento): Atendimento {
    const atendimentos = lerAtendimentos();
    const atendimento: Atendimento = { ...dados, id: Date.now() };
    atendimentos.unshift(atendimento);
    gravar(atendimentos);
    return atendimento;
}

export function atualizarAtendimento(atendimento: Atendimento): void {
    const atendimentos = lerAtendimentos();
    const indice = atendimentos.findIndex((item) => item.id === atendimento.id);
    if (indice === -1) {
        throw new Error('O atendimento que você tentou atualizar não foi encontrado.');
    }
    atendimentos[indice] = atendimento;
    gravar(atendimentos);
}

export function excluirAtendimento(id: number): void {
    gravar(lerAtendimentos().filter((item) => item.id !== id));
}

function gerarAtendimentosMock(): Atendimento[] {
    const pacientes = lerPacientes();
    const dadosClinicos: Record<number, Partial<DadosAtendimento> & { retorno?: Partial<DadosAtendimento> }> = {
        1: {
            profissao: 'Advogada', endereco: 'Rua das Flores, 120 - São Paulo/SP',
            queixaPrincipal: 'Emagrecimento saudável, deseja perder 6 kg em 4 meses.',
            historicoClinico: 'Sem comorbidades. Não usa medicamentos. Suplemento: vitamina D.',
            historicoAlimentar: 'Pula o café da manhã, come fora em quase todos os almoços e belisca à noite. Pouca ingestão de água.',
            circunferenciaCinturaCm: 82, percentualGordura: 31, massaMagra: 46.9,
            dadosBioquimicos: 'Glicemia de jejum 88 mg/dL; colesterol total 192 mg/dL; vitamina D 24 ng/mL.',
            diagnosticoNutricional: 'Sobrepeso com risco cardiometabólico aumentado; padrão alimentar irregular.',
            prescricaoDietetica: 'VET 1.650 kcal/dia; 50% carboidratos, 20% proteínas, 30% lipídios; 5 refeições ao dia.',
            metasOrientacoes: 'Incluir café da manhã, 2 L de água/dia, caminhada 3x/semana. Retorno em 30 dias.',
            retorno: { queixaPrincipal: 'Retorno: boa adesão, relata menos beliscos à noite.', pesoKg: 66.4, circunferenciaCinturaCm: 80, percentualGordura: 29.5, massaMagra: 46.8, metasOrientacoes: 'Manter plano e aumentar proteína no jantar.' }
        },
        2: {
            profissao: 'Personal trainer', endereco: 'Av. Atlântica, 450 - Rio de Janeiro/RJ',
            queixaPrincipal: 'Ganho de massa muscular.',
            historicoClinico: 'Sem comorbidades. Usa whey protein e creatina.',
            historicoAlimentar: 'Treina 5x por semana, ingestão proteica irregular e poucas verduras.',
            circunferenciaCinturaCm: 81, percentualGordura: 14, massaMagra: 70.5,
            dadosBioquimicos: 'Hemograma e perfil lipídico dentro da normalidade.',
            diagnosticoNutricional: 'Eutrofia com ingestão energética insuficiente para o objetivo.',
            prescricaoDietetica: 'VET 3.100 kcal/dia; 55% carboidratos, 25% proteínas, 20% lipídios.',
            metasOrientacoes: 'Aumentar 0,3 kg/semana, distribuir proteína em 5 refeições.'
        },
        3: {
            profissao: 'Professora', endereco: 'Rua da Bahia, 800 - Belo Horizonte/MG',
            queixaPrincipal: 'Desconforto intestinal e manutenção do peso.',
            historicoClinico: 'Intolerância à lactose diagnosticada. Sem medicamentos contínuos.',
            historicoAlimentar: 'Evita laticínios, mas consome pouco cálcio. Come muitos ultraprocessados.',
            circunferenciaCinturaCm: 76, percentualGordura: 28, massaMagra: 46,
            dadosBioquimicos: 'Ferritina 38 ng/mL; cálcio sérico normal.',
            diagnosticoNutricional: 'Eutrofia com risco de ingestão inadequada de cálcio.',
            prescricaoDietetica: 'VET 1.900 kcal/dia; dieta sem lactose, 50% carboidratos, 20% proteínas, 30% lipídios.',
            metasOrientacoes: 'Incluir fontes vegetais de cálcio e leites sem lactose.',
            retorno: { queixaPrincipal: 'Retorno: melhora dos sintomas intestinais.', pesoKg: 63.8, metasOrientacoes: 'Manter plano; avaliar exames de cálcio e vitamina D.' }
        },
        4: {
            profissao: 'Motorista', endereco: 'Rua XV de Novembro, 55 - Curitiba/PR',
            queixaPrincipal: 'Controle glicêmico e perda de peso.',
            historicoClinico: 'Diabetes tipo 2 há 6 anos. Usa metformina 850 mg 2x/dia.',
            historicoAlimentar: 'Consome refrigerante diariamente e refeições grandes e tardias.',
            circunferenciaCinturaCm: 104, percentualGordura: 32, massaMagra: 60.5,
            dadosBioquimicos: 'Glicemia de jejum 142 mg/dL; HbA1c 7,8%; triglicerídeos 210 mg/dL.',
            diagnosticoNutricional: 'Sobrepeso com controle glicêmico inadequado.',
            prescricaoDietetica: 'VET 2.000 kcal/dia; 45% carboidratos de baixo índice glicêmico, 25% proteínas, 30% lipídios.',
            metasOrientacoes: 'Substituir refrigerante por água, fracionar refeições, solicitar acompanhamento endocrinológico.',
            retorno: { queixaPrincipal: 'Retorno: reduziu refrigerante, glicemia em queda.', pesoKg: 86.5, circunferenciaCinturaCm: 101, dadosBioquimicos: 'Glicemia de jejum 118 mg/dL.', metasOrientacoes: 'Manter plano e iniciar caminhadas.' }
        },
        6: {
            profissao: 'Engenheiro', endereco: 'Quadra 305 Sul - Brasília/DF',
            queixaPrincipal: 'Melhorar desempenho para meia maratona.',
            historicoClinico: 'Sem comorbidades. Sem medicamentos.',
            historicoAlimentar: 'Treina 5x por semana; consumo baixo de carboidratos pré-treino.',
            circunferenciaCinturaCm: 77, percentualGordura: 12, massaMagra: 63.4,
            dadosBioquimicos: 'Ferritina 62 ng/mL; hemoglobina 15 g/dL.',
            diagnosticoNutricional: 'Eutrofia; ingestão energética insuficiente para o volume de treino.',
            prescricaoDietetica: 'VET 3.000 kcal/dia; 60% carboidratos, 20% proteínas, 20% lipídios.',
            metasOrientacoes: 'Estratégia de carga de carboidratos e hidratação durante os treinos longos.'
        },
        7: {
            profissao: 'Designer', endereco: 'Rua do Sol, 77 - Salvador/BA',
            queixaPrincipal: 'Reduzir sintomas da síndrome do intestino irritável.',
            historicoClinico: 'Síndrome do intestino irritável. Uso eventual de antiespasmódico.',
            historicoAlimentar: 'Ingestão baixa de fibras, longos períodos em jejum e muito café.',
            circunferenciaCinturaCm: 74, percentualGordura: 27, massaMagra: 44.5,
            dadosBioquimicos: 'Sem alterações relevantes.',
            diagnosticoNutricional: 'Eutrofia com padrão alimentar associado aos sintomas gastrointestinais.',
            prescricaoDietetica: 'VET 1.800 kcal/dia; orientação de dieta com baixo teor de FODMAPs.',
            metasOrientacoes: 'Diário alimentar e sintomas; retorno em 21 dias.',
            retorno: { queixaPrincipal: 'Retorno: redução de distensão abdominal.', metasOrientacoes: 'Iniciar reintrodução gradual de alimentos.' }
        }
    };

    const registros: Atendimento[] = [];
    let id = 1000;
    const datas: Record<number, [string, string]> = {
        1: ['2026-08-05', '2026-09-04'], 2: ['2026-09-12', ''], 3: ['2026-08-20', '2026-09-22'],
        4: ['2026-07-30', '2026-09-01'], 6: ['2026-10-03', ''], 7: ['2026-09-18', '2026-10-09']
    };

    for (const paciente of pacientes) {
        const clinico = dadosClinicos[paciente.id];
        if (!clinico) continue;
        const { retorno, ...base } = clinico;
        const [dataPrimeiro, dataRetorno] = datas[paciente.id];
        const primeiro: Atendimento = {
            ...atendimentoVazio('Primeiro atendimento'),
            ...base,
            id: id++,
            dataAtendimento: dataPrimeiro,
            pacienteId: paciente.id,
            nome: paciente.nome,
            dataNascimento: paciente.dataNascimento,
            sexo: paciente.sexo ?? '',
            telefone: paciente.telefone,
            pesoKg: paciente.pesoKg,
            alturaM: paciente.alturaCm ? paciente.alturaCm / 100 : null,
            evolucoes: [{ data: dataPrimeiro, registro: 'Avaliação inicial e entrega do plano alimentar.', assinatura: '' }]
        };
        registros.push(primeiro);

        if (retorno && dataRetorno) {
            registros.push({
                ...primeiro,
                ...retorno,
                id: id++,
                tipo: 'Retorno',
                dataAtendimento: dataRetorno,
                evolucoes: [
                    ...primeiro.evolucoes,
                    { data: dataRetorno, registro: retorno.queixaPrincipal ?? '', assinatura: '' }
                ]
            });
        }
    }

    return registros.sort((a, b) => b.dataAtendimento.localeCompare(a.dataAtendimento));
}
