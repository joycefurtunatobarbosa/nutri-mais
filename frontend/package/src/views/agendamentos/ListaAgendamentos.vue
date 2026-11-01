<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { lerPacientes, type Paciente } from '@/dados/pacientes';
import {
    agendamentoVazio,
    atualizarAgendamento,
    criarAgendamento,
    excluirAgendamento,
    lerAgendamentos,
    opcoesStatusAgendamento,
    opcoesTipoConsulta,
    type Agendamento,
    type DadosAgendamento,
    type StatusAgendamento
} from '@/dados/agendamentos';
import {
    atualizarEventoGoogle,
    conectarGoogle,
    criarEventoGoogle,
    desconectarGoogle,
    excluirEventoGoogle,
    googleConectado,
    googleConfigurado
} from '@/utils/googleCalendar';

const agendamentos = ref<Agendamento[]>([]);
const pacientes = ref<Paciente[]>([]);
const busca = ref('');
const filtroStatus = ref<StatusAgendamento | null>(null);
const dialogoFormulario = ref(false);
const dialogoExclusao = ref(false);
const edicaoId = ref<number | null>(null);
const formulario = ref<DadosAgendamento>(agendamentoVazio());
const sincronizar = ref(true);
const agendamentoParaExcluir = ref<Agendamento | null>(null);
const salvando = ref(false);
const conectado = ref(false);
const modo = ref<'calendario' | 'lista'>('calendario');
const mesAtual = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const mensagem = ref({ visivel: false, texto: '', cor: 'success' });

onMounted(() => {
    agendamentos.value = lerAgendamentos();
    pacientes.value = lerPacientes();
    conectado.value = googleConectado();
});

const opcoesPacientes = computed(() => pacientes.value.map((p) => ({ title: p.nome, value: p.id })));

const filtrados = computed(() => {
    const termo = (busca.value || '').trim().toLowerCase();
    return [...agendamentos.value]
        .filter((a) => !filtroStatus.value || a.status === filtroStatus.value)
        .filter((a) => !termo || a.paciente.toLowerCase().includes(termo))
        .sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`));
});

const horarioInvalido = computed(() => formulario.value.horaFim <= formulario.value.horaInicio);
const formularioValido = computed(
    () => !!formulario.value.paciente.trim() && !!formulario.value.data && !!formulario.value.horaInicio && !!formulario.value.horaFim && !horarioInvalido.value
);

function chaveData(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const tituloMes = computed(() => {
    const texto = mesAtual.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
});

const diasCalendario = computed(() => {
    const inicio = new Date(mesAtual.value);
    inicio.setDate(1 - inicio.getDay());
    const hoje = chaveData(new Date());
    return Array.from({ length: 42 }, (_, i) => {
        const dia = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate() + i);
        const chave = chaveData(dia);
        return {
            chave,
            numero: dia.getDate(),
            foraDoMes: dia.getMonth() !== mesAtual.value.getMonth(),
            hoje: chave === hoje,
            itens: filtrados.value.filter((a) => a.data === chave)
        };
    });
});

function mudarMes(delta: number) {
    mesAtual.value = new Date(mesAtual.value.getFullYear(), mesAtual.value.getMonth() + delta, 1);
}

function irParaHoje() {
    const h = new Date();
    mesAtual.value = new Date(h.getFullYear(), h.getMonth(), 1);
}

function avisar(texto: string, cor = 'success') {
    mensagem.value = { visivel: true, texto, cor };
}

function formatarData(iso: string): string {
    const [ano, mes, dia] = (iso || '').split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : '—';
}

function iniciais(nome: string): string {
    return nome.split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() || '?';
}

function classeStatus(status: StatusAgendamento) {
    return { Agendado: 'status-agendado', 'Concluído': 'status-concluido', Cancelado: 'status-cancelado' }[status];
}

function selecionarPaciente(id: number | null) {
    formulario.value.pacienteId = id;
    const paciente = pacientes.value.find((p) => p.id === id);
    if (paciente) formulario.value.paciente = paciente.nome;
}

function novo(data?: string) {
    edicaoId.value = null;
    formulario.value = agendamentoVazio();
    if (data) formulario.value.data = data;
    sincronizar.value = googleConfigurado();
    dialogoFormulario.value = true;
}

function editar(a: Agendamento) {
    const { id, ...dados } = a;
    edicaoId.value = id;
    formulario.value = { ...dados };
    sincronizar.value = googleConfigurado();
    dialogoFormulario.value = true;
}

async function alternarGoogle() {
    try {
        if (conectado.value) {
            desconectarGoogle();
            conectado.value = false;
            avisar('Google Agenda desconectado.');
        } else {
            await conectarGoogle();
            conectado.value = true;
            avisar('Google Agenda conectado.');
        }
    } catch (erro) {
        avisar((erro as Error).message, 'error');
    }
}

async function salvar() {
    if (!formularioValido.value) return;
    salvando.value = true;
    const dados = { ...formulario.value, paciente: formulario.value.paciente.trim() };
    let aviso = '';
    try {
        if (sincronizar.value) {
            try {
                const evento = dados.googleEventId
                    ? await atualizarEventoGoogle(dados.googleEventId, dados)
                    : await criarEventoGoogle(dados);
                if (evento) {
                    dados.googleEventId = evento.id;
                    dados.googleEventLink = evento.link;
                }
                conectado.value = googleConectado();
            } catch (erro) {
                aviso = `Salvo localmente, mas não sincronizou: ${(erro as Error).message}`;
            }
        }
        if (edicaoId.value === null) criarAgendamento(dados);
        else atualizarAgendamento({ ...dados, id: edicaoId.value });
        agendamentos.value = lerAgendamentos();
        dialogoFormulario.value = false;
        avisar(aviso || 'Agendamento salvo.', aviso ? 'warning' : 'success');
    } finally {
        salvando.value = false;
    }
}

function pedirExclusao(a: Agendamento) {
    agendamentoParaExcluir.value = a;
    dialogoExclusao.value = true;
}

async function confirmarExclusao() {
    const a = agendamentoParaExcluir.value;
    dialogoExclusao.value = false;
    if (!a) return;
    let aviso = '';
    if (a.googleEventId) {
        try {
            await excluirEventoGoogle(a.googleEventId);
            conectado.value = googleConectado();
        } catch (erro) {
            aviso = `Removido localmente, mas o evento do Google não foi excluído: ${(erro as Error).message}`;
        }
    }
    excluirAgendamento(a.id);
    agendamentos.value = lerAgendamentos();
    agendamentoParaExcluir.value = null;
    avisar(aviso || 'Agendamento excluído.', aviso ? 'warning' : 'success');
}
</script>

<template>
    <main class="pagina-agendamentos">
        <div class="cabecalho-pagina">
            <div>
                <div class="caminho-pagina">Início <span>/</span> Agendamentos</div>
                <h1>Agendamentos</h1>
                <p class="texto-introdutorio">Agende atendimentos e sincronize com o Google Agenda.</p>
            </div>
            <div class="acoes-cabecalho">
                <v-btn
                    v-if="googleConfigurado()"
                    variant="outlined"
                    color="primary"
                    size="large"
                    class="botao-novo"
                    @click="alternarGoogle"
                >
                    <Icon icon="solar:calendar-linear" width="20" class="me-2" />
                    {{ conectado ? 'Desconectar Google Agenda' : 'Conectar Google Agenda' }}
                </v-btn>
                <v-btn color="primary" size="large" class="botao-novo" @click="novo()">
                    <Icon icon="solar:add-circle-linear" width="20" class="me-2" />
                    Novo agendamento
                </v-btn>
            </div>
        </div>

        <v-card class="cartao-lista" elevation="0">
            <div class="barra-filtros">
                <div>
                    <h2>Todos os agendamentos</h2>
                    <p>{{ filtrados.length }} {{ filtrados.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados' }}</p>
                </div>
                <div class="filtros-direita">
                    <v-btn-toggle v-model="modo" mandatory divided density="comfortable" color="primary" variant="outlined" class="alternar-modo">
                        <v-btn value="calendario" aria-label="Ver calendário">
                            <Icon icon="solar:calendar-linear" width="18" class="me-1" />Calendário
                        </v-btn>
                        <v-btn value="lista" aria-label="Ver lista">
                            <Icon icon="solar:clipboard-list-linear" width="18" class="me-1" />Lista
                        </v-btn>
                    </v-btn-toggle>
                    <v-select
                        v-model="filtroStatus"
                        :items="opcoesStatusAgendamento"
                        aria-label="Filtrar por status"
                        placeholder="Todos os status"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        clearable
                        class="campo-tipo"
                    />
                    <v-text-field
                        v-model="busca"
                        aria-label="Buscar agendamento"
                        placeholder="Buscar por paciente"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        clearable
                        class="campo-busca"
                    />
                </div>
            </div>

            <div v-if="modo === 'calendario'" class="calendario">
                <div class="calendario-topo">
                    <v-btn icon variant="text" aria-label="Mês anterior" @click="mudarMes(-1)"><Icon icon="solar:alt-arrow-left-linear" width="20" /></v-btn>
                    <strong>{{ tituloMes }}</strong>
                    <v-btn icon variant="text" aria-label="Próximo mês" @click="mudarMes(1)"><Icon icon="solar:alt-arrow-right-linear" width="20" /></v-btn>
                    <v-btn variant="outlined" color="primary" size="small" class="botao-hoje" @click="irParaHoje">Hoje</v-btn>
                </div>
                <div class="calendario-grade">
                    <div v-for="d in diasSemana" :key="d" class="calendario-semana">{{ d }}</div>
                    <div
                        v-for="dia in diasCalendario"
                        :key="dia.chave"
                        class="calendario-dia"
                        :class="{ 'fora-mes': dia.foraDoMes, 'dia-hoje': dia.hoje }"
                        @click="novo(dia.chave)"
                    >
                        <span class="numero-dia">{{ dia.numero }}</span>
                        <button
                            v-for="a in dia.itens"
                            :key="a.id"
                            type="button"
                            class="evento-calendario"
                            :class="classeStatus(a.status)"
                            :title="`${a.horaInicio} – ${a.horaFim} · ${a.paciente} (${a.tipo})`"
                            @click.stop="editar(a)"
                        >
                            <b>{{ a.horaInicio }}</b> {{ a.paciente }}
                        </button>
                    </div>
                </div>
            </div>

            <div v-else class="tabela-responsiva">
                <table class="tabela-agendamentos">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Tipo</th>
                            <th>Status</th>
                            <th>Google</th>
                            <th>Editar</th>
                            <th>Excluir</th>
                        </tr>
                    </thead>
                    <tbody v-if="filtrados.length">
                        <tr v-for="a in filtrados" :key="a.id">
                            <td>
                                <div class="paciente-celula">
                                    <v-avatar size="40" color="lightprimary" class="avatar-paciente">{{ iniciais(a.paciente) }}</v-avatar>
                                    <span>{{ a.paciente }}</span>
                                </div>
                            </td>
                            <td>{{ formatarData(a.data) }}</td>
                            <td>{{ a.horaInicio }} – {{ a.horaFim }}</td>
                            <td>{{ a.tipo }}</td>
                            <td>
                                <span class="etiqueta-status" :class="classeStatus(a.status)">
                                    <span class="ponto-status" />
                                    {{ a.status }}
                                </span>
                            </td>
                            <td>
                                <a v-if="a.googleEventLink" :href="a.googleEventLink" target="_blank" rel="noopener noreferrer" class="link-google">Ver evento</a>
                                <span v-else>—</span>
                            </td>
                            <td>
                                <v-btn icon variant="text" color="primary" :aria-label="`Editar agendamento de ${a.paciente}`" title="Editar agendamento" @click="editar(a)">
                                    <Icon icon="solar:pen-linear" width="19" />
                                </v-btn>
                            </td>
                            <td>
                                <v-btn icon variant="text" color="error" :aria-label="`Excluir agendamento de ${a.paciente}`" title="Excluir agendamento" @click="pedirExclusao(a)">
                                    <Icon icon="solar:trash-bin-trash-linear" width="19" />
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="8" class="estado-vazio">
                                <Icon icon="solar:calendar-linear" width="28" />
                                <strong>{{ agendamentos.length ? 'Nenhum agendamento encontrado' : 'Nenhum agendamento registrado' }}</strong>
                                <span>{{ agendamentos.length ? 'Tente mudar a busca.' : 'Clique em “Novo agendamento” para começar.' }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </v-card>

        <v-dialog v-model="dialogoFormulario" max-width="560">
            <v-card>
                <v-card-title class="pt-6 px-6">{{ edicaoId === null ? 'Novo agendamento' : 'Editar agendamento' }}</v-card-title>
                <v-card-text class="px-6">
                    <v-select
                        :model-value="formulario.pacienteId"
                        :items="opcoesPacientes"
                        label="Paciente cadastrado (opcional)"
                        variant="outlined"
                        density="comfortable"
                        clearable
                        @update:model-value="selecionarPaciente"
                    />
                    <v-text-field v-model="formulario.paciente" label="Nome do paciente" variant="outlined" density="comfortable" />
                    <v-select v-model="formulario.tipo" :items="opcoesTipoConsulta" label="Tipo" variant="outlined" density="comfortable" />
                    <v-text-field v-model="formulario.data" type="date" label="Data" variant="outlined" density="comfortable" />
                    <div class="linha-horarios">
                        <v-text-field v-model="formulario.horaInicio" type="time" label="Início" variant="outlined" density="comfortable" />
                        <v-text-field
                            v-model="formulario.horaFim"
                            type="time"
                            label="Fim"
                            variant="outlined"
                            density="comfortable"
                            :error-messages="horarioInvalido ? 'O fim deve ser após o início' : ''"
                        />
                    </div>
                    <v-select v-model="formulario.status" :items="opcoesStatusAgendamento" label="Status" variant="outlined" density="comfortable" />
                    <v-textarea v-model="formulario.observacoes" label="Observações" variant="outlined" density="comfortable" rows="2" auto-grow />
                    <v-checkbox
                        v-if="googleConfigurado()"
                        v-model="sincronizar"
                        label="Sincronizar com o Google Agenda"
                        density="comfortable"
                        hide-details
                    />
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer />
                    <v-btn variant="text" :disabled="salvando" @click="dialogoFormulario = false">Cancelar</v-btn>
                    <v-btn color="primary" :loading="salvando" :disabled="!formularioValido" @click="salvar">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogoExclusao" max-width="440">
            <v-card>
                <v-card-title>Excluir agendamento</v-card-title>
                <v-card-text>
                    Deseja excluir o agendamento de <strong>{{ agendamentoParaExcluir?.paciente }}</strong>?
                    <span v-if="agendamentoParaExcluir?.googleEventId">O evento também será removido do Google Agenda.</span>
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer />
                    <v-btn variant="text" @click="dialogoExclusao = false">Cancelar</v-btn>
                    <v-btn color="error" @click="confirmarExclusao">Excluir</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="mensagem.visivel" :color="mensagem.cor" timeout="5000">{{ mensagem.texto }}</v-snackbar>
    </main>
</template>

<style scoped lang="scss">
.pagina-agendamentos { color: #0a2540; }
.cabecalho-pagina {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
    h1 { margin: 10px 0 6px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
}
.acoes-cabecalho { display: flex; flex-wrap: wrap; gap: 12px; }
.caminho-pagina, .texto-introdutorio, .barra-filtros p { color: #7b8893; }
.caminho-pagina {
    font-size: 13px;
    span { margin: 0 8px; color: #b6c0c8; }
}
.texto-introdutorio { margin: 0; font-size: 14px; }
.botao-novo { flex-shrink: 0; border-radius: 9px; text-transform: none; }
.cartao-lista { overflow: hidden; border: 1px solid #e8edf2; border-radius: 12px; }
.barra-filtros {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 24px;
    h2 { margin: 0 0 5px; font-size: 17px; font-weight: 700; }
    p { margin: 0; font-size: 13px; }
}
.filtros-direita { display: flex; gap: 12px; flex: 1; justify-content: flex-end; }
.campo-busca { max-width: 360px; }
.campo-tipo { max-width: 220px; }
.linha-horarios { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.alternar-modo { flex-shrink: 0; height: 48px; .v-btn { text-transform: none; } }
.calendario-topo {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 24px 16px;
    strong { min-width: 170px; text-align: center; font-size: 16px; }
}
.botao-hoje { margin-left: auto; border-radius: 9px; text-transform: none; }
.calendario-grade { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border-top: 1px solid #edf0f4; }
.calendario-semana { padding: 10px; color: #7b8893; background: #fafbfd; font-size: 12px; font-weight: 600; text-align: center; }
.calendario-dia {
    min-height: 112px;
    padding: 6px;
    border-top: 1px solid #edf0f4;
    border-left: 1px solid #edf0f4;
    cursor: pointer;
    &:nth-child(7n + 8) { border-left: 0; }
    &:hover { background: #fcfdff; }
    &.fora-mes { background: #fafbfd; .numero-dia { color: #b6c0c8; } }
    &.dia-hoje .numero-dia { color: #fff; background: #635bff; }
}
.numero-dia {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    margin-bottom: 4px;
    border-radius: 50%;
    color: #526170;
    font-size: 12px;
    font-weight: 600;
}
.evento-calendario {
    display: block;
    width: 100%;
    margin-bottom: 3px;
    padding: 3px 6px;
    overflow: hidden;
    border: 0;
    border-radius: 6px;
    font-size: 11px;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    &.status-agendado { color: #ad7410; background: #fff7e5; }
    &.status-concluido { color: #218653; background: #eaf8f0; }
    &.status-cancelado { color: #c0392b; background: #fdecea; text-decoration: line-through; }
}
.link-google { color: #635bff; font-weight: 600; text-decoration: none; }
.etiqueta-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    &.status-agendado { color: #ad7410; background: #fff7e5; }
    &.status-concluido { color: #218653; background: #eaf8f0; }
    &.status-cancelado { color: #c0392b; background: #fdecea; }
}
.ponto-status { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.tabela-responsiva { overflow-x: auto; }
.tabela-agendamentos {
    width: 100%;
    min-width: 900px;
    border-collapse: collapse;
    th, td { padding: 15px 24px; text-align: left; border-top: 1px solid #edf0f4; }
    th { color: #7b8893; background: #fafbfd; font-size: 12px; font-weight: 600; white-space: nowrap; }
    td { color: #526170; font-size: 13px; white-space: nowrap; }
    tbody tr:hover { background: #fcfdff; }
}
.paciente-celula { display: flex; align-items: center; gap: 12px; color: #0a2540; font-weight: 600; white-space: nowrap; }
.avatar-paciente { color: #635bff; font-size: 12px; font-weight: 700; }
.estado-vazio {
    height: 190px;
    color: #7b8893 !important;
    text-align: center !important;
    :deep(svg), strong, span { display: block; margin: 0 auto 8px; }
    strong { color: #0a2540; }
    span { font-size: 13px; }
}
@media (max-width: 700px) {
    .cabecalho-pagina {
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 20px;
        h1 { font-size: 24px; }
    }
    .acoes-cabecalho, .botao-novo { width: 100%; }
    .barra-filtros { align-items: stretch; flex-direction: column; padding: 20px 16px; }
    .filtros-direita { flex-direction: column; }
    .campo-busca, .campo-tipo { max-width: none; }
    .calendario-topo { padding: 0 12px 12px; strong { min-width: 0; flex: 1; } }
    .calendario-dia { min-height: 84px; padding: 3px; }
    .evento-calendario b { display: none; }
    .tabela-agendamentos { th, td { padding-right: 16px; padding-left: 16px; } }
}
</style>
