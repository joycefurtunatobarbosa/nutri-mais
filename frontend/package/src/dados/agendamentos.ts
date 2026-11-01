export type StatusAgendamento = 'Agendado' | 'Concluído' | 'Cancelado';
export type TipoConsulta = 'Primeiro atendimento' | 'Retorno';

export const opcoesTipoConsulta: TipoConsulta[] = ['Primeiro atendimento', 'Retorno'];
export const opcoesStatusAgendamento: StatusAgendamento[] = ['Agendado', 'Concluído', 'Cancelado'];

export interface Agendamento {
    id: number;
    pacienteId: number | null;
    paciente: string;
    tipo: TipoConsulta;
    data: string; // AAAA-MM-DD
    horaInicio: string; // HH:MM
    horaFim: string; // HH:MM
    observacoes: string;
    status: StatusAgendamento;
    googleEventId: string | null;
    googleEventLink: string | null;
}

export type DadosAgendamento = Omit<Agendamento, 'id'>;

const CHAVE_AGENDAMENTOS = 'nutriplanner:agendamentos';

function gerarAgendamentosMock(hoje = new Date()): Agendamento[] {
    const ano = hoje.getFullYear();
    const dataAtual = new Date(ano, hoje.getMonth(), hoje.getDate());
    const pacientes = [
        { id: 1, nome: 'Mariana Costa' },
        { id: 2, nome: 'Pedro Henrique' },
        { id: 3, nome: 'Camila Oliveira' },
        { id: 4, nome: 'Rafael Santos' },
        { id: 5, nome: 'Beatriz Almeida' },
        { id: 6, nome: 'Lucas Ferreira' },
        { id: 7, nome: 'Fernanda Lima' },
        { id: 8, nome: 'Gabriel Souza' }
    ];
    const horarios = [
        { inicio: '09:00', fim: '10:00' },
        { inicio: '14:00', fim: '15:00' }
    ];
    const agendamentos: Agendamento[] = [];
    let indice = 0;

    for (
        let data = dataAtual;
        data.getFullYear() === ano;
        data = new Date(ano, data.getMonth(), data.getDate() + 1)
    ) {
        if (data.getDay() !== 2 && data.getDay() !== 4) continue;

        const dataFormatada = `${ano}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
        for (const horario of horarios) {
            const horaInicio = Number(horario.inicio.slice(0, 2));
            if (new Date(ano, data.getMonth(), data.getDate(), horaInicio) < hoje) continue;

            const paciente = pacientes[indice % pacientes.length];
            agendamentos.push({
                id: Date.UTC(ano, data.getMonth(), data.getDate(), horaInicio),
                pacienteId: paciente.id,
                paciente: paciente.nome,
                tipo: indice % 4 === 0 ? 'Primeiro atendimento' : 'Retorno',
                data: dataFormatada,
                horaInicio: horario.inicio,
                horaFim: horario.fim,
                observacoes: indice % 4 === 0
                    ? 'Avaliação inicial e definição de metas.'
                    : 'Acompanhamento do plano alimentar.',
                status: 'Agendado',
                googleEventId: null,
                googleEventLink: null
            });
            indice += 1;
        }
    }

    return agendamentos;
}

export function agendamentoVazio(): DadosAgendamento {
    const agora = new Date();
    const data = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    return {
        pacienteId: null,
        paciente: '',
        tipo: 'Primeiro atendimento',
        data,
        horaInicio: '09:00',
        horaFim: '10:00',
        observacoes: '',
        status: 'Agendado',
        googleEventId: null,
        googleEventLink: null
    };
}

export function lerAgendamentos(): Agendamento[] {
    try {
        const valorSalvo = localStorage.getItem(CHAVE_AGENDAMENTOS);
        if (valorSalvo === null) {
            const exemplos = gerarAgendamentosMock();
            gravar(exemplos);
            return exemplos;
        }

        const dados: unknown = JSON.parse(valorSalvo);
        return Array.isArray(dados) ? (dados as Agendamento[]) : [];
    } catch (falha) {
        console.error('Não foi possível ler os agendamentos salvos.', falha);
        return [];
    }
}

function gravar(agendamentos: Agendamento[]) {
    localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(agendamentos));
}

export function criarAgendamento(dados: DadosAgendamento): Agendamento {
    const agendamentos = lerAgendamentos();
    const agendamento: Agendamento = { ...dados, id: Date.now() };
    agendamentos.unshift(agendamento);
    gravar(agendamentos);
    return agendamento;
}

export function atualizarAgendamento(agendamento: Agendamento): void {
    const agendamentos = lerAgendamentos();
    const indice = agendamentos.findIndex((item) => item.id === agendamento.id);
    if (indice === -1) {
        throw new Error('O agendamento não foi encontrado.');
    }
    agendamentos[indice] = agendamento;
    gravar(agendamentos);
}

export function excluirAgendamento(id: number): void {
    gravar(lerAgendamentos().filter((item) => item.id !== id));
}
