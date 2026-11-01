<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { criptografarPlano } from '@/dados/compartilhamentoPlano';
import { carregarAlimentosBase } from '@/dados/alimentos';
import { gerarCodigoHashPlano, obterPlanoMock, planosMock, type StatusPlanoMock } from '@/dados/planosMock';
import { lerPlanosSalvos, normalizarRefeicaoPlano, type RefeicaoPlano } from '@/dados/planosSalvos';

interface PlanoAlimentar {
    id: number;
    paciente: string;
    objetivo: string;
    nutricionista: string;
    calorias: number | null;
    refeicoes: number;
    atualizadoEm: string;
    status: StatusPlanoMock;
    itens?: RefeicaoPlano[];
}

const router = useRouter();
const planos = ref<PlanoAlimentar[]>([...planosMock]);

const busca = ref('');
const filtroStatus = ref('Todos os status');
const mensagem = ref('');
const corNotificacao = ref<'success' | 'error'>('success');
const notificacaoAberta = ref(false);
const gerandoPdfId = ref<number | null>(null);
const dialogoCompartilhamento = ref(false);
const planoSelecionado = ref<PlanoAlimentar | null>(null);
const versaoBaseAlimentos = ref(0);
const senhaCompartilhamento = ref('');
const linkCompartilhamento = ref('');
const erroCompartilhamento = ref('');
const gerandoLink = ref(false);
const CHAVE_LINKS = 'nutriplanner:links-compartilhados';

interface LinkSalvo {
    link: string;
    senha: string;
}

function codigoDoPlano(plano: PlanoAlimentar) {
    return gerarCodigoHashPlano(plano.itens ? 'salvo' : 'mock', plano.id, plano.paciente);
}

function lerLinksSalvos(): Record<string, LinkSalvo> {
    try {
        const dados: unknown = JSON.parse(localStorage.getItem(CHAVE_LINKS) ?? '{}');
        return typeof dados === 'object' && dados !== null && !Array.isArray(dados) ? (dados as Record<string, LinkSalvo>) : {};
    } catch (falha) {
        console.error('Não foi possível ler os links compartilhados salvos.', falha);
        return {};
    }
}

function salvarLink(codigo: string, valor: LinkSalvo | null) {
    const links = lerLinksSalvos();

    if (valor) {
        links[codigo] = valor;
    } else {
        delete links[codigo];
    }

    localStorage.setItem(CHAVE_LINKS, JSON.stringify(links));
}

function gerarNovoLink() {
    if (planoSelecionado.value) {
        salvarLink(codigoDoPlano(planoSelecionado.value), null);
    }

    linkCompartilhamento.value = '';
    senhaCompartilhamento.value = '';
    erroCompartilhamento.value = '';
}
const planoTemRefeicoes = computed(() =>
    Boolean(planoParaCompartilhar.value?.itens.some((refeicao) => refeicao.alimentos.length))
);

function itensDoPlano(plano: PlanoAlimentar): RefeicaoPlano[] {
    void versaoBaseAlimentos.value;

    if (plano.itens?.length) {
        return plano.itens;
    }

    return obterPlanoMock(plano.id)?.itens.map(normalizarRefeicaoPlano) ?? [];
}

async function garantirBaseAlimentosParaPlanoMock(): Promise<void> {
    await carregarAlimentosBase();
    versaoBaseAlimentos.value += 1;
}

const planoParaCompartilhar = computed(() => {
    const plano = planoSelecionado.value;

    if (!plano) {
        return null;
    }

    return {
        ...plano,
        itens: itensDoPlano(plano)
    };
});

function abrirPlano(plano: PlanoAlimentar) {
    const codigo = codigoDoPlano(plano);
    void router.push(`/planos-alimentares/${codigo}`);
}

const opcoesStatus = ['Todos os status', 'Ativo', 'Rascunho', 'Concluído'];

const planosFiltrados = computed(() => {
    const termo = busca.value.trim().toLocaleLowerCase('pt-BR');

    return planos.value.filter((plano) => {
        const correspondeBusca =
            !termo ||
            plano.paciente.toLocaleLowerCase('pt-BR').includes(termo) ||
            plano.objetivo.toLocaleLowerCase('pt-BR').includes(termo);
        const correspondeStatus = filtroStatus.value === 'Todos os status' || plano.status === filtroStatus.value;

        return correspondeBusca && correspondeStatus;
    });
});

const planosAtivos = computed(() => planos.value.filter((plano) => plano.status === 'Ativo').length);
const rascunhos = computed(() => planos.value.filter((plano) => plano.status === 'Rascunho').length);

function abrirCompartilhamento(plano: PlanoAlimentar) {
    planoSelecionado.value = plano;
    const salvo = lerLinksSalvos()[codigoDoPlano(plano)];
    senhaCompartilhamento.value = salvo?.senha ?? '';
    linkCompartilhamento.value = salvo?.link ?? '';
    erroCompartilhamento.value = '';
    dialogoCompartilhamento.value = true;
}

function atualizarDialogoCompartilhamento(aberto: boolean) {
    dialogoCompartilhamento.value = aberto;

    if (!aberto) {
        planoSelecionado.value = null;
        senhaCompartilhamento.value = '';
        linkCompartilhamento.value = '';
        erroCompartilhamento.value = '';
    }
}

async function gerarLinkCompartilhado() {
    if (!planoSelecionado.value) {
        erroCompartilhamento.value = 'Este plano não tem refeições para compartilhar.';
        return;
    }

    if (!/^\d{5}$/.test(senhaCompartilhamento.value)) {
        erroCompartilhamento.value = 'Use uma senha de 5 dígitos.';
        return;
    }

    gerandoLink.value = true;
    erroCompartilhamento.value = '';

    try {
        if (!planoSelecionado.value.itens) {
            await garantirBaseAlimentosParaPlanoMock();
        }

        const plano = planoParaCompartilhar.value;
        const itens = plano?.itens ?? [];
        if (!plano || !itens.some((refeicao) => refeicao.alimentos.length)) {
            erroCompartilhamento.value = 'Este plano não tem refeições para compartilhar.';
            return;
        }

        const token = await criptografarPlano(
            {
                paciente: plano.paciente,
                objetivo: plano.objetivo,
                nutricionista: plano.nutricionista,
                calorias: plano.calorias,
                refeicoes: itens.filter(
                    (refeicao) =>
                        refeicao.alimentos.length > 0 ||
                        refeicao.observacoes?.trim()
                ).length,
                atualizadoEm: plano.atualizadoEm,
                itens
            },
            senhaCompartilhamento.value
        );
        const url = new URL(router.resolve({ name: 'plano-compartilhado' }).href, window.location.origin);
        url.hash = new URLSearchParams({ plano: token }).toString();
        linkCompartilhamento.value = url.toString();
        salvarLink(codigoDoPlano(plano), { link: linkCompartilhamento.value, senha: senhaCompartilhamento.value });
    } catch (falha) {
        console.error('Não foi possível gerar o link protegido do plano.', falha);
        erroCompartilhamento.value = 'Não foi possível gerar o link protegido. Tente novamente.';
    } finally {
        gerandoLink.value = false;
    }
}

async function copiarLinkCompartilhado() {
    try {
        await navigator.clipboard.writeText(linkCompartilhamento.value);
        mensagem.value = 'Link copiado. Envie a senha ao paciente por outro canal.';
        corNotificacao.value = 'success';
        notificacaoAberta.value = true;
    } catch (falha) {
        console.error('Não foi possível copiar o link compartilhado.', falha);
        erroCompartilhamento.value = 'Não foi possível copiar automaticamente. Selecione e copie o link acima.';
    }
}

async function gerarPdfDoPlano(plano: PlanoAlimentar) {
    gerandoPdfId.value = plano.id;

    try {
        if (!plano.itens) {
            await garantirBaseAlimentosParaPlanoMock();
        }

        const itens = itensDoPlano(plano);
        if (!itens.some((refeicao) => refeicao.alimentos.length)) {
            mensagem.value = 'Este plano não tem refeições cadastradas para gerar o PDF.';
            corNotificacao.value = 'error';
            notificacaoAberta.value = true;
            return;
        }

        const { gerarPdfPlano } = await import('@/utils/gerarPdfPlano');
        gerarPdfPlano({
            paciente: plano.paciente,
            objetivo: plano.objetivo,
            nutricionista: plano.nutricionista,
            atualizadoEm: plano.atualizadoEm,
            itens
        });
    } catch (falha) {
        console.error('Não foi possível gerar o PDF do plano.', falha);
        mensagem.value = 'Não foi possível gerar o PDF do plano. Tente novamente.';
        corNotificacao.value = 'error';
        notificacaoAberta.value = true;
    } finally {
        gerandoPdfId.value = null;
    }
}

onMounted(() => {
    try {
        planos.value.unshift(...lerPlanosSalvos());
    } catch (falha) {
        console.error('Não foi possível carregar os planos salvos.', falha);
        mensagem.value = 'Não foi possível carregar os planos salvos neste navegador.';
        corNotificacao.value = 'error';
        notificacaoAberta.value = true;
    }
});
</script>

<template>
    <main class="pagina-planos">
        <div class="cabecalho-pagina">
            <div>
                <div class="caminho-pagina">Início <span>/</span> Planos alimentares</div>
                <h1>Planos alimentares</h1>
                <p class="texto-introdutorio">Organize e acompanhe os planos dos seus pacientes em um só lugar.</p>
            </div>
            <v-btn color="primary" size="large" class="botao-novo-plano" to="/planos-alimentares/novo">
                <Icon icon="solar:add-circle-linear" width="20" class="me-2" />
                Novo plano
            </v-btn>
        </div>

        <v-row class="mb-2">
            <v-col cols="12" sm="4">
                <v-card class="cartao-resumo" elevation="0">
                    <div class="icone-resumo roxo"><Icon icon="solar:clipboard-list-linear" width="22" /></div>
                    <div><p>Total de planos</p><strong>{{ planos.length }}</strong></div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="4">
                <v-card class="cartao-resumo" elevation="0">
                    <div class="icone-resumo verde"><Icon icon="solar:check-read-linear" width="22" /></div>
                    <div><p>Planos ativos</p><strong>{{ planosAtivos }}</strong></div>
                </v-card>
            </v-col>
            <v-col cols="12" sm="4">
                <v-card class="cartao-resumo" elevation="0">
                    <div class="icone-resumo amarelo"><Icon icon="solar:document-add-linear" width="22" /></div>
                    <div><p>Rascunhos</p><strong>{{ rascunhos }}</strong></div>
                </v-card>
            </v-col>
        </v-row>

        <v-card class="cartao-lista" elevation="0">
            <div class="barra-filtros">
                <div>
                    <h2>Todos os planos</h2>
                    <p>{{ planosFiltrados.length }} {{ planosFiltrados.length === 1 ? 'plano encontrado' : 'planos encontrados' }}</p>
                </div>
                <div class="controles-filtro">
                    <v-text-field
                        v-model="busca"
                        aria-label="Buscar por paciente ou objetivo"
                        placeholder="Buscar paciente ou objetivo"
                        prepend-inner-icon="mdi-magnify"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        clearable
                        class="campo-busca"
                    />
                    <v-select
                        v-model="filtroStatus"
                        :items="opcoesStatus"
                        aria-label="Filtrar por status"
                        variant="outlined"
                        density="comfortable"
                        hide-details
                        class="campo-status"
                    />
                </div>
            </div>

            <div class="tabela-responsiva">
                <table class="tabela-planos">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Objetivo</th>
                            <th>Plano diário</th>
                            <th>Última atualização</th>
                            <th>Status</th>
                            <th>Abrir</th>
                            <th>PDF</th>
                            <th>Compartilhar</th>
                        </tr>
                    </thead>
                    <tbody v-if="planosFiltrados.length">
                        <tr v-for="plano in planosFiltrados" :key="plano.id">
                            <td>
                                <div class="paciente-celula">
                                    <v-avatar size="40" color="lightprimary" class="avatar-paciente">
                                        {{ plano.paciente.split(' ').map((parte) => parte[0]).slice(0, 2).join('') }}
                                    </v-avatar>
                                    <span>{{ plano.paciente }}</span>
                                </div>
                            </td>
                            <td>{{ plano.objetivo }}</td>
                            <td>
                                <strong class="valor-calorias">{{ plano.calorias === null ? '—' : `${plano.calorias.toLocaleString('pt-BR')} kcal` }}</strong>
                                <span class="texto-refeicoes">{{ plano.refeicoes }} refeições</span>
                            </td>
                            <td>{{ plano.atualizadoEm }}</td>
                            <td>
                                <span class="etiqueta-status" :class="`status-${plano.status.toLocaleLowerCase('pt-BR')}`">
                                    <span class="ponto-status" />
                                    {{ plano.status }}
                                </span>
                            </td>
                            <td>
                                <v-btn
                                    icon
                                    variant="text"
                                    color="primary"
                                    :aria-label="`Abrir plano de ${plano.paciente}`"
                                    title="Abrir plano alimentar"
                                    @click="abrirPlano(plano)"
                                >
                                    <Icon icon="solar:folder-open-linear" width="19" />
                                </v-btn>
                            </td>
                            <td>
                                <v-btn
                                    icon
                                    variant="text"
                                    color="primary"
                                    :loading="gerandoPdfId === plano.id"
                                    :aria-label="`Gerar PDF do plano de ${plano.paciente}`"
                                    title="Gerar PDF do plano"
                                    @click="gerarPdfDoPlano(plano)"
                                >
                                    <Icon icon="solar:printer-linear" width="19" />
                                </v-btn>
                            </td>
                            <td>
                                <v-btn
                                    icon
                                    variant="text"
                                    color="primary"
                                    :aria-label="`Compartilhar plano de ${plano.paciente}`"
                                    :title="plano.itens?.some((refeicao) => refeicao.alimentos.length) || obterPlanoMock(plano.id)
                                        ? 'Gerar link protegido para o paciente'
                                        : 'Este plano não tem refeições cadastradas para compartilhar'"
                                    @click="abrirCompartilhamento(plano)"
                                >
                                    <Icon icon="solar:share-linear" width="19" />
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="8" class="estado-vazio">
                                <Icon icon="solar:magnifer-linear" width="28" />
                                <strong>Nenhum plano encontrado</strong>
                                <span>Tente mudar a busca ou o filtro de status.</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </v-card>

        <v-dialog
            :model-value="dialogoCompartilhamento"
            max-width="560"
            @update:model-value="atualizarDialogoCompartilhamento"
        >
            <v-card class="dialogo-compartilhamento">
                <v-card-title>Compartilhar plano com o paciente</v-card-title>
                <v-card-text>
                    <p v-if="planoTemRefeicoes" class="texto-dialogo">
                        Crie uma senha de 5 dígitos. O plano será criptografado no link e só poderá ser aberto com essa senha.
                        Envie a senha ao paciente por outro canal.
                    </p>
                    <v-alert v-else type="info" variant="tonal" class="mb-4">
                        Este plano não possui refeições e alimentos cadastrados, então ainda não é possível gerar o link.
                        Crie e salve um plano com as refeições para compartilhar com o paciente.
                    </v-alert>
                    <v-alert v-if="erroCompartilhamento" type="error" variant="tonal" class="mb-4">
                        {{ erroCompartilhamento }}
                    </v-alert>
                    <v-text-field
                        v-if="planoTemRefeicoes"
                        v-model="senhaCompartilhamento"
                        label="Senha do plano (5 dígitos)"
                        type="text"
                        inputmode="numeric"
                        maxlength="5"
                        autocomplete="off"
                        @update:model-value="senhaCompartilhamento = String($event ?? '').replace(/\D/g, '').slice(0, 5)"
                        variant="outlined"
                        :readonly="Boolean(linkCompartilhamento)"
                    />
                    <div v-if="linkCompartilhamento" class="campo-link">
                        <v-text-field
                            :model-value="linkCompartilhamento"
                            label="Link protegido"
                            variant="outlined"
                            readonly
                            hide-details
                        />
                        <v-btn color="primary" variant="tonal" aria-label="Copiar link protegido" @click="copiarLinkCompartilhado">
                            <Icon icon="solar:copy-linear" width="18" class="me-2" />
                            Copiar
                        </v-btn>
                        <v-btn color="primary" variant="tonal" :href="linkCompartilhamento" target="_blank" rel="noopener" aria-label="Abrir link protegido">
                            <Icon icon="solar:link-linear" width="18" class="me-2" />
                            Abrir
                        </v-btn>
                    </div>
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer />
                    <v-btn variant="text" @click="atualizarDialogoCompartilhamento(false)">Fechar</v-btn>
                    <v-btn v-if="linkCompartilhamento" variant="text" @click="gerarNovoLink">Gerar novo link</v-btn>
                    <v-btn
                        v-if="planoTemRefeicoes"
                        color="primary"
                        :loading="gerandoLink"
                        :disabled="Boolean(linkCompartilhamento)"
                        @click="gerarLinkCompartilhado"
                    >
                        Gerar link protegido
                    </v-btn>
                    <v-btn v-else color="primary" to="/planos-alimentares/novo" @click="atualizarDialogoCompartilhamento(false)">
                        Criar plano com refeições
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="notificacaoAberta" :color="corNotificacao" timeout="3000">{{ mensagem }}</v-snackbar>
    </main>
</template>

<style scoped lang="scss">
.pagina-planos { color: #0a2540; }
.cabecalho-pagina {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 28px;
    h1 { margin: 10px 0 6px; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
}
.caminho-pagina, .texto-introdutorio, .cartao-resumo p, .barra-filtros p { color: #7b8893; }
.caminho-pagina {
    font-size: 13px;
    span { margin: 0 8px; color: #b6c0c8; }
}
.texto-introdutorio { margin: 0; font-size: 14px; }
.botao-novo-plano { flex-shrink: 0; border-radius: 9px; text-transform: none; }
.cartao-resumo {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 104px;
    padding: 20px;
    border: 1px solid #e8edf2;
    border-radius: 12px;
    p { margin: 0 0 6px; font-size: 13px; }
    strong { font-size: 24px; font-weight: 700; }
}
.icone-resumo {
    display: grid;
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    place-items: center;
    border-radius: 12px;
    &.roxo { color: #635bff; background: #f0efff; }
    &.verde { color: #28a66a; background: #eaf8f0; }
    &.amarelo { color: #d89614; background: #fff7e5; }
}
.cartao-lista { margin-top: 10px; overflow: hidden; border: 1px solid #e8edf2; border-radius: 12px; }
.barra-filtros {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 22px 24px;
    h2 { margin: 0 0 5px; font-size: 17px; font-weight: 700; }
    p { margin: 0; font-size: 13px; }
}
.controles-filtro { display: flex; align-items: center; gap: 12px; width: min(100%, 520px); }
.campo-busca { flex: 1; }
.campo-status { width: 175px; flex: 0 0 175px; }
.dialogo-compartilhamento .texto-dialogo { margin: 0 0 18px; color: #7b8893; font-size: 13px; line-height: 1.6; }
.campo-link { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 10px; }
.campo-link .v-input { flex: 1 1 100%; }
.campo-link .v-btn { min-height: 56px; }
.tabela-responsiva { overflow-x: auto; }
.tabela-planos {
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
.valor-calorias, .texto-refeicoes { display: block; white-space: nowrap; }
.valor-calorias { color: #0a2540; font-weight: 600; }
.texto-refeicoes { margin-top: 4px; color: #7b8893; font-size: 12px; }
.etiqueta-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    &.status-ativo { color: #218653; background: #eaf8f0; }
    &.status-rascunho { color: #ad7410; background: #fff7e5; }
    &.status-concluído { color: #647282; background: #f0f2f5; }
}
.ponto-status { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
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
    .botao-novo-plano { width: 100%; }
    .barra-filtros { align-items: flex-start; flex-direction: column; padding: 20px 16px; }
    .controles-filtro { align-items: stretch; flex-direction: column; }
    .campo-status { width: 100%; flex-basis: auto; }
    .tabela-planos {
        th, td { padding-right: 16px; padding-left: 16px; }
    }
}
</style>
