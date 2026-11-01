<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import {
    excluirAtendimento,
    lerAtendimentos,
    type Atendimento,
    type TipoAtendimento
} from '@/dados/atendimentos';

const router = useRouter();
const atendimentos = ref<Atendimento[]>([]);
const busca = ref('');
const filtroTipo = ref<TipoAtendimento | null>(null);
const dialogoExclusao = ref(false);
const atendimentoParaExcluir = ref<Atendimento | null>(null);

onMounted(() => {
    atendimentos.value = lerAtendimentos();
});

const filtrados = computed(() => {
    const termo = (busca.value || '').trim().toLowerCase();
    return atendimentos.value
        .filter((a) => !filtroTipo.value || a.tipo === filtroTipo.value)
        .filter((a) => !termo || a.nome.toLowerCase().includes(termo))
        .sort((a, b) => b.dataAtendimento.localeCompare(a.dataAtendimento));
});

function formatarData(iso: string): string {
    const [ano, mes, dia] = (iso || '').split('-');
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : '—';
}

function iniciais(nome: string): string {
    return nome.split(' ').filter(Boolean).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() || '?';
}

function pedirExclusao(a: Atendimento) {
    atendimentoParaExcluir.value = a;
    dialogoExclusao.value = true;
}

function confirmarExclusao() {
    if (atendimentoParaExcluir.value) {
        excluirAtendimento(atendimentoParaExcluir.value.id);
        atendimentos.value = lerAtendimentos();
    }
    dialogoExclusao.value = false;
    atendimentoParaExcluir.value = null;
}
</script>

<template>
    <main class="pagina-atendimentos">
        <div class="cabecalho-pagina">
            <div>
                <div class="caminho-pagina">Início <span>/</span> Atendimentos</div>
                <h1>Atendimentos</h1>
                <p class="texto-introdutorio">Registre primeiros atendimentos e retornos com o prontuário nutricional.</p>
            </div>
            <v-btn color="primary" size="large" class="botao-novo" @click="router.push('/atendimentos/novo')">
                <Icon icon="solar:add-circle-linear" width="20" class="me-2" />
                Novo atendimento
            </v-btn>
        </div>

        <v-card class="cartao-lista" elevation="0">
            <div class="barra-filtros">
                <div>
                    <h2>Todos os atendimentos</h2>
                    <p>{{ filtrados.length }} {{ filtrados.length === 1 ? 'atendimento encontrado' : 'atendimentos encontrados' }}</p>
                </div>
                <div class="filtros-direita">
                    <v-select
                        v-model="filtroTipo"
                        :items="['Primeiro atendimento', 'Retorno']"
                        aria-label="Filtrar por tipo"
                        placeholder="Todos os tipos"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        clearable
                        class="campo-tipo"
                    />
                    <v-text-field
                        v-model="busca"
                        aria-label="Buscar atendimento"
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

            <div class="tabela-responsiva">
                <table class="tabela-atendimentos">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Queixa / objetivo</th>
                            <th>Abrir</th>
                            <th>Excluir</th>
                        </tr>
                    </thead>
                    <tbody v-if="filtrados.length">
                        <tr v-for="a in filtrados" :key="a.id">
                            <td>
                                <div class="paciente-celula">
                                    <v-avatar size="40" color="lightprimary" class="avatar-paciente">{{ iniciais(a.nome) }}</v-avatar>
                                    <span>{{ a.nome || '—' }}</span>
                                </div>
                            </td>
                            <td>{{ formatarData(a.dataAtendimento) }}</td>
                            <td>
                                <span class="etiqueta-status" :class="a.tipo === 'Retorno' ? 'tipo-retorno' : 'tipo-primeiro'">
                                    <span class="ponto-status" />
                                    {{ a.tipo }}
                                </span>
                            </td>
                            <td class="celula-objetivo">{{ a.queixaPrincipal || '—' }}</td>
                            <td>
                                <v-btn icon variant="text" color="primary" :aria-label="`Abrir atendimento de ${a.nome}`" title="Abrir atendimento" @click="router.push(`/atendimentos/${a.id}`)">
                                    <Icon icon="solar:pen-linear" width="19" />
                                </v-btn>
                            </td>
                            <td>
                                <v-btn icon variant="text" color="error" :aria-label="`Excluir atendimento de ${a.nome}`" title="Excluir atendimento" @click="pedirExclusao(a)">
                                    <Icon icon="solar:trash-bin-trash-linear" width="19" />
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="6" class="estado-vazio">
                                <Icon icon="solar:clipboard-list-linear" width="28" />
                                <strong>{{ atendimentos.length ? 'Nenhum atendimento encontrado' : 'Nenhum atendimento registrado' }}</strong>
                                <span>{{ atendimentos.length ? 'Tente mudar a busca.' : 'Clique em “Novo atendimento” para começar.' }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </v-card>

        <v-dialog v-model="dialogoExclusao" max-width="440">
            <v-card>
                <v-card-title>Excluir atendimento</v-card-title>
                <v-card-text>
                    Deseja excluir o atendimento de <strong>{{ atendimentoParaExcluir?.nome }}</strong>? Esta ação não pode ser desfeita.
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer />
                    <v-btn variant="text" @click="dialogoExclusao = false">Cancelar</v-btn>
                    <v-btn color="error" @click="confirmarExclusao">Excluir</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </main>
</template>

<style scoped lang="scss">
.pagina-atendimentos { color: #0a2540; }
.cabecalho-pagina {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
    h1 { margin: 10px 0 6px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
}
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
.etiqueta-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    &.tipo-primeiro { color: #218653; background: #eaf8f0; }
    &.tipo-retorno { color: #ad7410; background: #fff7e5; }
}
.ponto-status { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.tabela-responsiva { overflow-x: auto; }
.tabela-atendimentos {
    width: 100%;
    min-width: 760px;
    border-collapse: collapse;
    th, td { padding: 15px 24px; text-align: left; border-top: 1px solid #edf0f4; }
    th { color: #7b8893; background: #fafbfd; font-size: 12px; font-weight: 600; white-space: nowrap; }
    td { color: #526170; font-size: 13px; }
    tbody tr:hover { background: #fcfdff; }
}
.paciente-celula { display: flex; align-items: center; gap: 12px; color: #0a2540; font-weight: 600; white-space: nowrap; }
.avatar-paciente { color: #635bff; font-size: 12px; font-weight: 700; }
.celula-objetivo { max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
    .botao-novo { width: 100%; }
    .barra-filtros { align-items: stretch; flex-direction: column; padding: 20px 16px; }
    .filtros-direita { flex-direction: column; }
    .campo-busca, .campo-tipo { max-width: none; }
    .tabela-atendimentos { th, td { padding-right: 16px; padding-left: 16px; } }
}
</style>
