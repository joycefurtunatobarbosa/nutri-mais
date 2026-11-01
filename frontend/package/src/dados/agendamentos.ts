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
        const dados: unknown = JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS) ?? '[]');
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
