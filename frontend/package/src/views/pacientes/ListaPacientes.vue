<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Icon } from '@iconify/vue';
import {
    atualizarPaciente,
    calcularIdade,
    criarPaciente,
    excluirPaciente,
    lerPacientes,
    opcoesGrupoRDA,
    opcoesNivelAtividadeFisica,
    opcoesObjetivoNutricional,
    rotuloGrupoRDA,
    type DadosPaciente,
    type Paciente,
    type SexoPaciente
} from '@/dados/pacientes';

const pacientes = ref<Paciente[]>([]);
const busca = ref('');
const dialogoFormulario = ref(false);
const dialogoExclusao = ref(false);
const abaFormulario = ref('pessoais');
const pacienteEditandoId = ref<number | null>(null);
const pacienteParaExcluir = ref<Paciente | null>(null);
const erroFormulario = ref('');
const mensagem = ref('');
const corNotificacao = ref<'success' | 'error'>('success');
const notificacaoAberta = ref(false);

function formularioVazio(): DadosPaciente {
    return {
        nome: '',
        dataNascimento: '',
        sexo: null,
        grupo: null,
        objetivoNutricional: null,
        pesoKg: null,
        alturaCm: null,
        nivelAtividadeFisica: null,
        estagioFisiologicoEER: 'Nenhum',
        semanasGestacao: null,
        classificacaoPesoGestacional: null,
        email: '',
        telefone: '',
        observacoes: ''
    };
}

const formulario = ref<DadosPaciente>(formularioVazio());
const opcoesSexo: SexoPaciente[] = ['Feminino', 'Masculino', 'Outro', 'Prefiro não informar'];
const opcoesEstagioEER = [
    { title: 'Não se aplica', value: 'Nenhum' },
    { title: 'Gestação', value: 'Gestação' },
    { title: 'Aleitamento exclusivo (0 a 6 meses pós-parto)', value: 'Aleitamento exclusivo (0–6 meses)' },
    { title: 'Aleitamento parcial (7 a 12 meses pós-parto)', value: 'Aleitamento parcial (7–12 meses)' }
];
const opcoesClassificacaoGestacional = ['Baixo peso', 'Peso normal', 'Sobrepeso', 'Obesidade'];

const pacientesFiltrados = computed(() => {
    const termo = busca.value.trim().toLocaleLowerCase('pt-BR');

    return pacientes.value.filter(
        (paciente) =>
            !termo ||
            paciente.nome.toLocaleLowerCase('pt-BR').includes(termo) ||
            paciente.email.toLocaleLowerCase('pt-BR').includes(termo) ||
            paciente.telefone.includes(termo)
    );
});

function notificar(texto: string, cor: 'success' | 'error' = 'success') {
    mensagem.value = texto;
    corNotificacao.value = cor;
    notificacaoAberta.value = true;
}

function normalizarMedida(valor: number | null): number | null {
    return typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
}

function iniciais(nome: string) {
    return nome.split(' ').filter(Boolean).map((parte) => parte[0]).slice(0, 2).join('').toLocaleUpperCase('pt-BR');
}

function abrirNovo() {
    pacienteEditandoId.value = null;
    formulario.value = formularioVazio();
    abaFormulario.value = 'pessoais';
    erroFormulario.value = '';
    dialogoFormulario.value = true;
}

function abrirEdicao(paciente: Paciente) {
    pacienteEditandoId.value = paciente.id;
    formulario.value = {
        nome: paciente.nome,
        dataNascimento: paciente.dataNascimento,
        sexo: paciente.sexo,
        grupo: paciente.grupo,
        objetivoNutricional: paciente.objetivoNutricional,
        pesoKg: paciente.pesoKg,
        alturaCm: paciente.alturaCm,
        nivelAtividadeFisica: paciente.nivelAtividadeFisica,
        estagioFisiologicoEER: paciente.estagioFisiologicoEER,
        semanasGestacao: paciente.semanasGestacao,
        classificacaoPesoGestacional: paciente.classificacaoPesoGestacional,
        email: paciente.email,
        telefone: paciente.telefone,
        observacoes: paciente.observacoes
    };
    abaFormulario.value = 'pessoais';
    erroFormulario.value = '';
    dialogoFormulario.value = true;
}

function salvar() {
    const dados: DadosPaciente = {
        nome: formulario.value.nome.trim(),
        dataNascimento: formulario.value.dataNascimento,
        sexo: formulario.value.sexo,
        grupo: formulario.value.grupo,
        objetivoNutricional: formulario.value.objetivoNutricional,
        pesoKg: normalizarMedida(formulario.value.pesoKg),
        alturaCm: normalizarMedida(formulario.value.alturaCm),
        nivelAtividadeFisica: formulario.value.nivelAtividadeFisica,
        estagioFisiologicoEER: formulario.value.estagioFisiologicoEER,
        semanasGestacao: normalizarMedida(formulario.value.semanasGestacao),
        classificacaoPesoGestacional: formulario.value.classificacaoPesoGestacional,
        email: formulario.value.email.trim(),
        telefone: formulario.value.telefone.trim(),
        observacoes: formulario.value.observacoes.trim()
    };

    if (!dados.nome) {
        erroFormulario.value = 'Informe o nome do paciente.';
        return;
    }

    if (dados.dataNascimento && (calcularIdade(dados.dataNascimento) === null || dados.dataNascimento < '1900-01-01')) {
        erroFormulario.value = 'Informe uma data de nascimento válida.';
        return;
    }

    if ((dados.pesoKg !== null && dados.pesoKg <= 0) || (dados.alturaCm !== null && dados.alturaCm <= 0)) {
        erroFormulario.value = 'Peso e altura devem ser maiores que zero.';
        abaFormulario.value = 'nutricao';
        return;
    }

    if (dados.email && !/^\S+@\S+\.\S+$/.test(dados.email)) {
        erroFormulario.value = 'Informe um e-mail válido.';
        return;
    }

    try {
        if (pacienteEditandoId.value === null) {
            criarPaciente(dados);
            notificar('Paciente cadastrado.');
        } else {
            atualizarPaciente({ ...dados, id: pacienteEditandoId.value });
            notificar('Paciente atualizado.');
        }

        pacientes.value = lerPacientes();
        dialogoFormulario.value = false;
    } catch (falha) {
        console.error('Não foi possível salvar o paciente.', falha);
        erroFormulario.value = 'Não foi possível salvar o paciente. Tente novamente.';
    }
}

function pedirExclusao(paciente: Paciente) {
    pacienteParaExcluir.value = paciente;
    dialogoExclusao.value = true;
}

function confirmarExclusao() {
    if (pacienteParaExcluir.value) {
        excluirPaciente(pacienteParaExcluir.value.id);
        pacientes.value = lerPacientes();
        notificar('Paciente excluído.');
    }

    dialogoExclusao.value = false;
    pacienteParaExcluir.value = null;
}

onMounted(() => {
    pacientes.value = lerPacientes();
});
</script>

<template>
    <main class="pagina-pacientes">
        <div class="cabecalho-pagina">
            <div>
                <div class="caminho-pagina">Início <span>/</span> Pacientes</div>
                <h1>Pacientes</h1>
                <p class="texto-introdutorio">Cadastre e gerencie os pacientes que recebem seus planos alimentares.</p>
            </div>
            <v-btn color="primary" size="large" class="botao-novo" @click="abrirNovo">
                <Icon icon="solar:add-circle-linear" width="20" class="me-2" />
                Novo paciente
            </v-btn>
        </div>

        <v-card class="cartao-lista" elevation="0">
            <div class="barra-filtros">
                <div>
                    <h2>Todos os pacientes</h2>
                    <p>{{ pacientesFiltrados.length }} {{ pacientesFiltrados.length === 1 ? 'paciente encontrado' : 'pacientes encontrados' }}</p>
                </div>
                <v-text-field
                    v-model="busca"
                    aria-label="Buscar paciente"
                    placeholder="Buscar por nome, e-mail ou telefone"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    class="campo-busca"
                />
            </div>

            <div class="tabela-responsiva">
                <table class="tabela-pacientes">
                    <thead>
                        <tr>
                            <th>Paciente</th>
                            <th>Sexo</th>
                            <th>Grupo RDA</th>
                            <th>Idade</th>
                            <th>E-mail</th>
                            <th>Objetivo nutricional</th>
                            <th>Editar</th>
                            <th>Excluir</th>
                        </tr>
                    </thead>
                    <tbody v-if="pacientesFiltrados.length">
                        <tr v-for="paciente in pacientesFiltrados" :key="paciente.id">
                            <td>
                                <div class="paciente-celula">
                                    <v-avatar size="40" color="lightprimary" class="avatar-paciente">{{ iniciais(paciente.nome) }}</v-avatar>
                                    <span>{{ paciente.nome }}</span>
                                </div>
                            </td>
                            <td>{{ paciente.sexo || '—' }}</td>
                            <td>{{ rotuloGrupoRDA(paciente.grupo) }}</td>
                            <td>{{ calcularIdade(paciente.dataNascimento) === null ? '—' : `${calcularIdade(paciente.dataNascimento)} anos` }}</td>
                            <td>{{ paciente.email || '—' }}</td>
                            <td class="celula-objetivo">{{ paciente.objetivoNutricional || '—' }}</td>
                            <td>
                                <v-btn
                                    icon
                                    variant="text"
                                    color="primary"
                                    :aria-label="`Editar ${paciente.nome}`"
                                    title="Editar paciente"
                                    @click="abrirEdicao(paciente)"
                                >
                                    <Icon icon="solar:pen-linear" width="19" />
                                </v-btn>
                            </td>
                            <td>
                                <v-btn
                                    icon
                                    variant="text"
                                    color="error"
                                    :aria-label="`Excluir ${paciente.nome}`"
                                    title="Excluir paciente"
                                    @click="pedirExclusao(paciente)"
                                >
                                    <Icon icon="solar:trash-bin-trash-linear" width="19" />
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                    <tbody v-else>
                        <tr>
                            <td colspan="8" class="estado-vazio">
                                <Icon icon="solar:users-group-rounded-linear" width="28" />
                                <strong>{{ pacientes.length ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado' }}</strong>
                                <span>{{ pacientes.length ? 'Tente mudar a busca.' : 'Clique em “Novo paciente” para começar.' }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </v-card>

        <v-dialog v-model="dialogoFormulario" max-width="700" scrollable>
            <v-card class="formulario-paciente">
                <v-card-title>{{ pacienteEditandoId === null ? 'Novo paciente' : 'Editar paciente' }}</v-card-title>
                <v-card-text>
                    <v-alert v-if="erroFormulario" type="error" variant="tonal" class="mb-4">{{ erroFormulario }}</v-alert>
                    <v-tabs v-model="abaFormulario" class="mb-5">
                        <v-tab value="pessoais">Dados pessoais</v-tab>
                        <v-tab value="nutricao">Nutrição e EER</v-tab>
                    </v-tabs>
                    <v-window v-model="abaFormulario">
                        <v-window-item value="pessoais">
                            <v-text-field v-model="formulario.nome" label="Nome completo" variant="outlined" autofocus />
                            <v-select v-model="formulario.sexo" :items="opcoesSexo" label="Sexo" variant="outlined" clearable />
                            <v-select
                                v-model="formulario.grupo"
                                :items="opcoesGrupoRDA"
                                item-title="title"
                                item-value="value"
                                label="Grupo de referência RDA"
                                hint="Para menores de 9 anos, o grupo é definido pela faixa etária."
                                persistent-hint
                                variant="outlined"
                                clearable
                            />
                            <v-text-field
                                v-model="formulario.dataNascimento"
                                label="Data de nascimento"
                                type="date"
                                variant="outlined"
                                max="9999-12-31"
                            />
                            <v-text-field
                                label="Idade"
                                :model-value="calcularIdade(formulario.dataNascimento) ?? ''"
                                suffix="anos"
                                variant="outlined"
                                readonly
                            />
                            <v-text-field v-model="formulario.email" label="E-mail" type="email" variant="outlined" />
                            <v-text-field v-model="formulario.telefone" label="Telefone" variant="outlined" />
                            <v-textarea v-model="formulario.observacoes" label="Observações" variant="outlined" rows="3" hide-details />
                        </v-window-item>
                        <v-window-item value="nutricao">
                            <v-select
                                v-model="formulario.objetivoNutricional"
                                :items="opcoesObjetivoNutricional"
                                label="Objetivo nutricional"
                                variant="outlined"
                                clearable
                            />
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model.number="formulario.pesoKg"
                                        label="Peso"
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        suffix="kg"
                                        variant="outlined"
                                    />
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        v-model.number="formulario.alturaCm"
                                        label="Altura"
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        suffix="cm"
                                        variant="outlined"
                                    />
                                </v-col>
                            </v-row>
                            <v-select
                                v-model="formulario.nivelAtividadeFisica"
                                :items="opcoesNivelAtividadeFisica"
                                item-title="title"
                                item-value="value"
                                label="Nível de atividade física"
                                hint="Categorias PAL usadas pelas equações EER do National Academies (2023). Não há conversão direta de frequência semanal para PAL."
                                persistent-hint
                                variant="outlined"
                                clearable
                            />
                            <p class="fonte-atividade">
                                Para referência geral de atividade física no Brasil, consulte o
                                <a
                                    href="https://bvsms.saude.gov.br/bvs/publicacoes/guia_atividade_fisica_populacao_brasileira.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >Guia de Atividade Física para a População Brasileira</a>
                                (Ministério da Saúde).
                            </p>
                            <v-select
                                v-model="formulario.estagioFisiologicoEER"
                                :items="opcoesEstagioEER"
                                item-title="title"
                                item-value="value"
                                label="Gestação ou aleitamento"
                                variant="outlined"
                            />
                            <template v-if="formulario.estagioFisiologicoEER === 'Gestação'">
                                <v-text-field
                                    v-model.number="formulario.semanasGestacao"
                                    label="Semanas de gestação"
                                    type="number"
                                    min="1"
                                    max="42"
                                    step="1"
                                    variant="outlined"
                                />
                                <v-select
                                    v-if="(formulario.semanasGestacao ?? 0) >= 14"
                                    v-model="formulario.classificacaoPesoGestacional"
                                    :items="opcoesClassificacaoGestacional"
                                    label="Classificação de peso gestacional"
                                    hint="Use a classificação pré-gestacional registrada no atendimento."
                                    persistent-hint
                                    variant="outlined"
                                    clearable
                                />
                            </template>
                        </v-window-item>
                    </v-window>
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer />
                    <v-btn variant="text" @click="dialogoFormulario = false">Cancelar</v-btn>
                    <v-btn color="primary" @click="salvar">Salvar</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="dialogoExclusao" max-width="440">
            <v-card>
                <v-card-title>Excluir paciente</v-card-title>
                <v-card-text>
                    Deseja excluir <strong>{{ pacienteParaExcluir?.nome }}</strong>? Os planos alimentares já criados não serão removidos.
                </v-card-text>
                <v-card-actions class="px-6 pb-6">
                    <v-spacer />
                    <v-btn variant="text" @click="dialogoExclusao = false">Cancelar</v-btn>
                    <v-btn color="error" @click="confirmarExclusao">Excluir</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar v-model="notificacaoAberta" :color="corNotificacao" timeout="3000">{{ mensagem }}</v-snackbar>
    </main>
</template>

<style scoped lang="scss">
.pagina-pacientes { color: #0a2540; }
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
.campo-busca { max-width: 360px; }
.tabela-responsiva { overflow-x: auto; }
.tabela-pacientes {
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
.formula-eer { overflow-wrap: anywhere; }
.formulario-paciente :deep(.v-label) { color: #34495c; font-weight: 700; opacity: 1; }
.fonte-atividade { margin: -12px 0 20px; color: #647282; font-size: 12px; line-height: 1.5; }
.fonte-atividade a { color: #635bff; }
@media (max-width: 700px) {
    .cabecalho-pagina {
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 20px;
        h1 { font-size: 24px; }
    }
    .botao-novo { width: 100%; }
    .barra-filtros { align-items: stretch; flex-direction: column; padding: 20px 16px; }
    .campo-busca { max-width: none; }
    .tabela-pacientes { th, td { padding-right: 16px; padding-left: 16px; } }
}
</style>
