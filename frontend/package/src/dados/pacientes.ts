export type SexoPaciente = 'Feminino' | 'Masculino' | 'Outro' | 'Prefiro não informar';
export type GrupoRDA = 'Infants' | 'Children' | 'Males' | 'Females' | 'Pregnancy' | 'Lactation';
export type ObjetivoNutricional = 'Emagrecimento' | 'Manutenção do peso' | 'Ganho de peso' | 'Recomposição corporal' | 'Outro';
export type NivelAtividadeFisica = 'Inativo' | 'Pouco ativo' | 'Ativo' | 'Muito ativo';
export type EstagioFisiologicoEER = 'Nenhum' | 'Gestação' | 'Aleitamento exclusivo (0–6 meses)' | 'Aleitamento parcial (7–12 meses)';
export type ClassificacaoPesoGestacional = 'Baixo peso' | 'Peso normal' | 'Sobrepeso' | 'Obesidade';

export const opcoesGrupoRDA: { title: string; value: GrupoRDA }[] = [
    { title: 'Lactentes', value: 'Infants' },
    { title: 'Crianças', value: 'Children' },
    { title: 'Homens', value: 'Males' },
    { title: 'Mulheres', value: 'Females' },
    { title: 'Gestantes', value: 'Pregnancy' },
    { title: 'Lactantes', value: 'Lactation' }
];

export const opcoesObjetivoNutricional: ObjetivoNutricional[] = [
    'Emagrecimento',
    'Manutenção do peso',
    'Ganho de peso',
    'Recomposição corporal',
    'Outro'
];

export const opcoesNivelAtividadeFisica: { title: string; value: NivelAtividadeFisica }[] = [
    { title: 'Inativo (Inactive)', value: 'Inativo' },
    { title: 'Pouco ativo (Low active)', value: 'Pouco ativo' },
    { title: 'Ativo (Active)', value: 'Ativo' },
    { title: 'Muito ativo (Very active)', value: 'Muito ativo' }
];

export function rotuloGrupoRDA(grupo: GrupoRDA | null): string {
    return opcoesGrupoRDA.find((opcao) => opcao.value === grupo)?.title ?? '—';
}

export interface Paciente {
    id: number;
    nome: string;
    dataNascimento: string;
    sexo: SexoPaciente | null;
    grupo: GrupoRDA | null;
    objetivoNutricional: ObjetivoNutricional | null;
    pesoKg: number | null;
    alturaCm: number | null;
    nivelAtividadeFisica: NivelAtividadeFisica | null;
    estagioFisiologicoEER: EstagioFisiologicoEER;
    semanasGestacao: number | null;
    classificacaoPesoGestacional: ClassificacaoPesoGestacional | null;
    email: string;
    telefone: string;
    observacoes: string;
}

export type DadosPaciente = Omit<Paciente, 'id'>;
type PacienteArmazenado = Partial<Omit<Paciente, 'nivelAtividadeFisica'>> & {
    nivelAtividadeFisica?: NivelAtividadeFisica | 'Sedentário' | null;
};

const CHAVE_PACIENTES = 'nutriplanner:pacientes';

const dadosEERMocks: Record<number, Pick<
    Paciente,
    | 'objetivoNutricional'
    | 'pesoKg'
    | 'alturaCm'
    | 'nivelAtividadeFisica'
    | 'estagioFisiologicoEER'
    | 'semanasGestacao'
    | 'classificacaoPesoGestacional'
>> = {
    1: { objetivoNutricional: 'Emagrecimento', pesoKg: 68, alturaCm: 165, nivelAtividadeFisica: 'Pouco ativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    2: { objetivoNutricional: 'Ganho de peso', pesoKg: 82, alturaCm: 178, nivelAtividadeFisica: 'Ativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    3: { objetivoNutricional: 'Manutenção do peso', pesoKg: 64, alturaCm: 162, nivelAtividadeFisica: 'Pouco ativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    4: { objetivoNutricional: 'Manutenção do peso', pesoKg: 89, alturaCm: 174, nivelAtividadeFisica: 'Pouco ativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    5: { objetivoNutricional: 'Manutenção do peso', pesoKg: 58, alturaCm: 168, nivelAtividadeFisica: 'Inativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    6: { objetivoNutricional: 'Ganho de peso', pesoKg: 72, alturaCm: 180, nivelAtividadeFisica: 'Muito ativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    7: { objetivoNutricional: 'Manutenção do peso', pesoKg: 61, alturaCm: 164, nivelAtividadeFisica: 'Inativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null },
    8: { objetivoNutricional: 'Manutenção do peso', pesoKg: 75, alturaCm: 176, nivelAtividadeFisica: 'Pouco ativo', estagioFisiologicoEER: 'Nenhum', semanasGestacao: null, classificacaoPesoGestacional: null }
};

const pacientesMock: Paciente[] = ([
    { id: 1, nome: 'Mariana Costa', dataNascimento: '1991-03-14', sexo: 'Feminino', grupo: 'Females', email: 'mariana.costa@email.com', telefone: '(11) 98765-4321', observacoes: 'Foco em emagrecimento saudável.' },
    { id: 2, nome: 'Pedro Henrique', dataNascimento: '1998-07-22', sexo: 'Masculino', grupo: 'Males', email: 'pedro.henrique@email.com', telefone: '(21) 97654-3210', observacoes: 'Pratica musculação 5x por semana.' },
    { id: 3, nome: 'Camila Oliveira', dataNascimento: '1989-11-05', sexo: 'Feminino', grupo: 'Females', email: 'camila.oliveira@email.com', telefone: '(31) 98888-1122', observacoes: 'Intolerante à lactose.' },
    { id: 4, nome: 'Rafael Santos', dataNascimento: '1975-02-18', sexo: 'Masculino', grupo: 'Males', email: 'rafael.santos@email.com', telefone: '(41) 99777-3344', observacoes: 'Diabetes tipo 2.' },
    { id: 5, nome: 'Beatriz Almeida', dataNascimento: '1993-09-30', sexo: 'Feminino', grupo: 'Females', email: 'beatriz.almeida@email.com', telefone: '(51) 99666-5566', observacoes: '' },
    { id: 6, nome: 'Lucas Ferreira', dataNascimento: '1996-05-09', sexo: 'Masculino', grupo: 'Males', email: 'lucas.ferreira@email.com', telefone: '(61) 98555-7788', observacoes: 'Corredor amador, treina para meia maratona.' },
    { id: 7, nome: 'Fernanda Lima', dataNascimento: '1985-12-01', sexo: 'Feminino', grupo: 'Females', email: 'fernanda.lima@email.com', telefone: '(71) 98444-9900', observacoes: 'Síndrome do intestino irritável.' },
    { id: 8, nome: 'Gabriel Souza', dataNascimento: '2001-08-17', sexo: 'Masculino', grupo: 'Males', email: 'gabriel.souza@email.com', telefone: '(81) 98333-0011', observacoes: '' }
] as const).map((paciente): Paciente => ({
    ...paciente,
    ...dadosEERMocks[paciente.id]
}));

export function lerPacientes(): Paciente[] {
    try {
        const valorSalvo = localStorage.getItem(CHAVE_PACIENTES);

        // Na primeira utilização, grava os pacientes de exemplo para que possam ser editados ou excluídos.
        if (valorSalvo === null) {
            gravar(pacientesMock);
            return [...pacientesMock];
        }

        const dados: unknown = JSON.parse(valorSalvo);
        return Array.isArray(dados)
            ? (dados as PacienteArmazenado[]).map((paciente) => {
                const exemplo = pacientesMock.find((item) => item.id === paciente.id && item.nome === paciente.nome);
                const mockEER = exemplo && paciente.objetivoNutricional == null &&
                    paciente.pesoKg == null &&
                    paciente.alturaCm == null &&
                    paciente.nivelAtividadeFisica == null
                    ? dadosEERMocks[exemplo.id]
                    : null;
                return {
                    ...paciente,
                    dataNascimento: paciente.dataNascimento ?? exemplo?.dataNascimento ?? '',
                    sexo: paciente.sexo ?? exemplo?.sexo ?? null,
                    grupo: paciente.grupo !== undefined
                        ? paciente.grupo
                        : exemplo?.grupo ?? (
                            paciente.sexo === 'Feminino' ? 'Females' : paciente.sexo === 'Masculino' ? 'Males' : null
                        ),
                    objetivoNutricional: paciente.objetivoNutricional ?? mockEER?.objetivoNutricional ?? null,
                    pesoKg: paciente.pesoKg ?? mockEER?.pesoKg ?? null,
                    alturaCm: paciente.alturaCm ?? mockEER?.alturaCm ?? null,
                    nivelAtividadeFisica: paciente.nivelAtividadeFisica === 'Sedentário'
                        ? 'Inativo'
                        : paciente.nivelAtividadeFisica ?? mockEER?.nivelAtividadeFisica ?? null,
                    estagioFisiologicoEER: paciente.estagioFisiologicoEER ?? 'Nenhum',
                    semanasGestacao: paciente.semanasGestacao ?? null,
                    classificacaoPesoGestacional: paciente.classificacaoPesoGestacional ?? null,
                    id: paciente.id ?? Date.now(),
                    nome: paciente.nome ?? '',
                    email: paciente.email ?? '',
                    telefone: paciente.telefone ?? '',
                    observacoes: paciente.observacoes ?? ''
                };
            })
            : [];
    } catch (falha) {
        console.error('Não foi possível ler os pacientes salvos.', falha);
        return [];
    }
}

function gravar(pacientes: Paciente[]) {
    localStorage.setItem(CHAVE_PACIENTES, JSON.stringify(pacientes));
}

export function criarPaciente(dados: DadosPaciente): Paciente {
    const pacientes = lerPacientes();
    const paciente: Paciente = { ...dados, id: Date.now() };
    pacientes.unshift(paciente);
    gravar(pacientes);
    return paciente;
}

export function atualizarPaciente(paciente: Paciente): void {
    const pacientes = lerPacientes();
    const indice = pacientes.findIndex((item) => item.id === paciente.id);

    if (indice === -1) {
        throw new Error('O paciente que você tentou atualizar não foi encontrado.');
    }

    pacientes[indice] = paciente;
    gravar(pacientes);
}

export function excluirPaciente(id: number): void {
    gravar(lerPacientes().filter((paciente) => paciente.id !== id));
}

export function calcularIdade(dataNascimento: string, hoje = new Date()): number | null {
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);

    if (!ano || !mes || !dia) {
        return null;
    }

    let idade = hoje.getFullYear() - ano;

    if (hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia)) {
        idade -= 1;
    }

    return idade >= 0 ? idade : null;
}

export function calcularIdadeEmMeses(dataNascimento: string, hoje = new Date()): number | null {
    const [ano, mes, dia] = dataNascimento.split('-').map(Number);

    if (!ano || !mes || !dia) {
        return null;
    }

    const nascimento = new Date(ano, mes - 1, dia);
    if (
        nascimento.getFullYear() !== ano ||
        nascimento.getMonth() !== mes - 1 ||
        nascimento.getDate() !== dia ||
        nascimento > hoje
    ) {
        return null;
    }

    let meses = (hoje.getFullYear() - ano) * 12 + hoje.getMonth() - (mes - 1);
    if (hoje.getDate() < dia) {
        meses -= 1;
    }

    return meses >= 0 ? meses : null;
}

export function formatarDataNascimento(dataNascimento: string): string {
    const [ano, mes, dia] = dataNascimento.split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : '—';
}
