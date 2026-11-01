<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import {
    atendimentoVazio,
    atualizarAtendimento,
    buscarAtendimento,
    calcularIMC,
    criarAtendimento,
    opcoesTipoAtendimento,
    type DadosAtendimento
} from '@/dados/atendimentos';
import { calcularIdade, lerPacientes, type Paciente } from '@/dados/pacientes';

const route = useRoute();
const router = useRouter();

const idEdicao = computed(() => (route.params.id ? Number(route.params.id) : null));
const formulario = ref<DadosAtendimento>(atendimentoVazio());
const pacientes = ref<Paciente[]>([]);
const erro = ref('');

const imc = computed(() => calcularIMC(formulario.value.pesoKg, formulario.value.alturaM));
const idade = computed(() => calcularIdade(formulario.value.dataNascimento));
const menorDeIdade = computed(() => idade.value !== null && idade.value < 18);

onMounted(() => {
    pacientes.value = lerPacientes();
    if (idEdicao.value !== null) {
        const existente = buscarAtendimento(idEdicao.value);
        if (existente) {
            const { id: _id, ...dados } = existente;
            formulario.value = dados;
        } else {
            erro.value = 'Atendimento não encontrado.';
        }
    }
});

function preencherComPaciente(id: number | null) {
    const p = pacientes.value.find((item) => item.id === id);
    if (!p) return;
    const f = formulario.value;
    f.nome = p.nome;
    f.dataNascimento = p.dataNascimento;
    f.sexo = p.sexo ?? '';
    f.telefone = p.telefone;
    f.pesoKg = f.pesoKg ?? p.pesoKg;
    f.alturaM = f.alturaM ?? (p.alturaCm ? p.alturaCm / 100 : null);
}

watch(() => formulario.value.pacienteId, preencherComPaciente);

function adicionarEvolucao() {
    formulario.value.evolucoes.push({ data: '', registro: '', assinatura: '' });
}

function removerEvolucao(indice: number) {
    formulario.value.evolucoes.splice(indice, 1);
}

function salvar() {
    erro.value = '';
    if (!formulario.value.nome.trim()) {
        erro.value = 'Informe o nome completo do paciente.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }
    if (idEdicao.value !== null) {
        atualizarAtendimento({ ...formulario.value, id: idEdicao.value });
    } else {
        criarAtendimento(formulario.value);
    }
    router.push('/atendimentos');
}

const numero = (v: unknown) => (v === '' || v === null || v === undefined ? null : Number(v));
</script>

<template>
    <main class="pagina-atendimentos">
        <div class="cabecalho-pagina">
            <div>
                <div class="caminho-pagina">
                    Início <span>/</span> <a @click="router.push('/atendimentos')">Atendimentos</a> <span>/</span> {{ idEdicao ? 'Prontuário' : 'Novo' }}
                </div>
                <div class="titulo-com-voltar">
                    <v-btn icon variant="text" aria-label="Voltar" title="Voltar" class="botao-voltar" to="/atendimentos"><v-icon>mdi-arrow-left</v-icon></v-btn>
                    <h1>{{ idEdicao ? 'Prontuário de assistência nutricional' : 'Novo atendimento' }}</h1>
                </div>
                <p class="texto-introdutorio">Modelo simplificado em conformidade com a Resolução CFN nº 594/2017.</p>
            </div>
            <v-btn color="primary" size="large" class="botao-novo" @click="salvar">
                <Icon icon="solar:diskette-linear" width="20" class="me-2" />
                Salvar atendimento
            </v-btn>
        </div>

        <v-alert v-if="erro" type="error" variant="tonal" class="mb-4">{{ erro }}</v-alert>

        <v-card class="cartao-secao" elevation="0">
            <div class="titulo-secao"><h2>Dados do atendimento</h2></div>
            <div class="corpo-secao">
                <v-row>
                    <v-col cols="12" md="4">
                        <v-select v-model="formulario.tipo" :items="opcoesTipoAtendimento" label="Tipo de atendimento" variant="outlined" />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-text-field v-model="formulario.dataAtendimento" type="date" label="Data do atendimento" variant="outlined" max="9999-12-31" />
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-select
                            v-model="formulario.pacienteId"
                            :items="pacientes"
                            item-title="nome"
                            item-value="id"
                            label="Paciente cadastrado"
                            hint="Preenche os dados de identificação."
                            persistent-hint
                            variant="outlined"
                            clearable
                        />
                    </v-col>
                </v-row>
            </div>
        </v-card>

        <v-card class="cartao-secao" elevation="0">
            <div class="titulo-secao"><h2>1. Identificação do Paciente</h2></div>
            <div class="corpo-secao">
                <v-row>
                    <v-col cols="12"><v-text-field v-model="formulario.nome" label="Nome Completo" variant="outlined" /></v-col>
                    <v-col cols="12" md="4"><v-text-field v-model="formulario.dataNascimento" type="date" label="Data de Nascimento" variant="outlined" max="9999-12-31" /></v-col>
                    <v-col cols="12" md="4"><v-text-field :model-value="idade ?? ''" label="Idade" suffix="anos" variant="outlined" readonly /></v-col>
                    <v-col cols="12" md="4">
                        <v-select v-model="formulario.sexo" :items="['Feminino', 'Masculino', 'Outro', 'Prefiro não informar']" label="Sexo / Gênero" variant="outlined" clearable />
                    </v-col>
                    <v-col cols="12" md="6"><v-text-field v-model="formulario.profissao" label="Profissão" variant="outlined" /></v-col>
                    <v-col cols="12" md="6"><v-text-field v-model="formulario.telefone" label="Telefone" variant="outlined" /></v-col>
                    <v-col cols="12"><v-text-field v-model="formulario.endereco" label="Endereço Residencial" variant="outlined" /></v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="formulario.responsavelLegal"
                            :label="menorDeIdade ? 'Nome do Responsável Legal (menor de idade)' : 'Nome do Responsável Legal (se menor de idade)'"
                            variant="outlined"
                        />
                    </v-col>
                </v-row>
            </div>
        </v-card>

        <v-card class="cartao-secao" elevation="0">
            <div class="titulo-secao"><h2>2. Anamnese Nutricional e Histórico de Saúde</h2></div>
            <div class="corpo-secao">
                <v-textarea v-model="formulario.queixaPrincipal" label="Objetivo da Consulta / Queixa Principal" variant="outlined" rows="3" auto-grow />
                <v-textarea v-model="formulario.historicoClinico" label="Histórico Clínico, Patológico e Uso de Medicamentos/Suplementos" variant="outlined" rows="3" auto-grow />
                <v-textarea v-model="formulario.historicoAlimentar" label="Histórico Alimentar e Hábitos de Vida" variant="outlined" rows="3" auto-grow />
            </div>
        </v-card>

        <v-card class="cartao-secao" elevation="0">
            <div class="titulo-secao"><h2>3. Avaliação de Estado Nutricional e Exames</h2></div>
            <div class="corpo-secao">
                <p class="subtitulo">Dados Antropométricos e Triagem</p>
                <v-row>
                    <v-col cols="12" sm="6" md="4"><v-text-field :model-value="formulario.pesoKg" @update:model-value="formulario.pesoKg = numero($event)" type="number" step="0.1" min="0" label="Peso (kg)" variant="outlined" /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field :model-value="formulario.alturaM" @update:model-value="formulario.alturaM = numero($event)" type="number" step="0.01" min="0" label="Altura (m)" variant="outlined" /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field :model-value="imc ?? ''" label="IMC (kg/m²)" variant="outlined" readonly /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field :model-value="formulario.circunferenciaCinturaCm" @update:model-value="formulario.circunferenciaCinturaCm = numero($event)" type="number" step="0.1" min="0" label="Circ. Cintura (cm)" variant="outlined" /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field :model-value="formulario.percentualGordura" @update:model-value="formulario.percentualGordura = numero($event)" type="number" step="0.1" min="0" label="% Gordura" variant="outlined" /></v-col>
                    <v-col cols="12" sm="6" md="4"><v-text-field :model-value="formulario.massaMagra" @update:model-value="formulario.massaMagra = numero($event)" type="number" step="0.1" min="0" label="Massa Magra" variant="outlined" /></v-col>
                </v-row>
                <v-textarea v-model="formulario.dadosBioquimicos" label="Dados Bioquímicos (Exames Laboratoriais relevantes)" variant="outlined" rows="3" auto-grow />
                <v-textarea v-model="formulario.diagnosticoNutricional" label="Diagnóstico Nutricional" variant="outlined" rows="3" auto-grow />
            </div>
        </v-card>

        <v-card class="cartao-secao" elevation="0">
            <div class="titulo-secao"><h2>4. Conduta, Prescrição e Plano Alimentar</h2></div>
            <div class="corpo-secao">
                <v-textarea v-model="formulario.prescricaoDietetica" label="Prescrição Dietética (VET, Macronutrientes e Características da Dieta)" variant="outlined" rows="4" auto-grow />
                <v-textarea v-model="formulario.metasOrientacoes" label="Metas, Orientações Nutricionais e Encaminhamentos" variant="outlined" rows="4" auto-grow />
            </div>
        </v-card>

        <v-card class="cartao-secao" elevation="0">
            <div class="titulo-secao">
                <h2>5. Acompanhamento e Evolução Nutricional</h2>
                <v-btn variant="text" color="primary" class="botao-texto" @click="adicionarEvolucao">
                    <Icon icon="solar:add-circle-linear" width="18" class="me-1" />
                    Adicionar registro
                </v-btn>
            </div>
            <div class="corpo-secao">
                <v-row v-for="(evolucao, indice) in formulario.evolucoes" :key="indice">
                    <v-col cols="12" md="2"><v-text-field v-model="evolucao.data" type="date" label="Data" variant="outlined" max="9999-12-31" /></v-col>
                    <v-col cols="12" md="6"><v-textarea v-model="evolucao.registro" label="Registro de Evolução (Queixas, Adesão, Alterações)" variant="outlined" rows="1" auto-grow /></v-col>
                    <v-col cols="10" md="3"><v-text-field v-model="evolucao.assinatura" label="Assinatura" variant="outlined" /></v-col>
                    <v-col cols="2" md="1" class="d-flex justify-center">
                        <v-btn icon variant="text" color="error" aria-label="Remover registro" title="Remover registro" @click="removerEvolucao(indice)">
                            <Icon icon="solar:trash-bin-trash-linear" width="19" />
                        </v-btn>
                    </v-col>
                </v-row>
                <v-text-field v-model="formulario.assinaturaNutricionista" label="Assinatura do(a) Nutricionista / Carimbo e Nº de Inscrição no CRN" variant="outlined" />
            </div>
        </v-card>

        <p class="aviso-legal">
            Este documento contém dados confidenciais protegidos pelo sigilo profissional (Resolução CFN nº 594/2017) e pela Lei Geral de Proteção de Dados (LGPD).
            O prontuário deve ser arquivado pelo prazo mínimo de 20 anos a partir do último registro.
        </p>

        <div class="rodape-acoes">
            <v-btn variant="text" class="botao-texto" @click="router.push('/atendimentos')">Cancelar</v-btn>
            <v-btn color="primary" size="large" class="botao-novo" @click="salvar">Salvar atendimento</v-btn>
        </div>
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
.caminho-pagina, .texto-introdutorio { color: #7b8893; }
.caminho-pagina {
    font-size: 13px;
    span { margin: 0 8px; color: #b6c0c8; }
    a { cursor: pointer; color: inherit; }
}
.texto-introdutorio { margin: 0; font-size: 14px; }
.titulo-com-voltar { display: flex; align-items: center; gap: 8px; }
.titulo-com-voltar .botao-voltar { margin-left: -8px; margin-top: 4px; }
.botao-novo { flex-shrink: 0; border-radius: 9px; text-transform: none; }
.botao-texto { text-transform: none; }
.cartao-secao { margin-bottom: 20px; overflow: hidden; border: 1px solid #e8edf2; border-radius: 12px; }
.titulo-secao {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    background: #fafbfd;
    border-bottom: 1px solid #edf0f4;
    h2 { margin: 0; font-size: 17px; font-weight: 700; }
}
.corpo-secao { padding: 24px; }
.subtitulo { margin: 0 0 12px; color: #34495c; font-size: 14px; font-weight: 700; }
.corpo-secao :deep(.v-label) { color: #34495c; font-weight: 700; opacity: 1; }
.aviso-legal { margin: 0 0 20px; color: #7b8893; font-size: 12px; line-height: 1.5; }
.rodape-acoes { display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 24px; }
@media (max-width: 700px) {
    .cabecalho-pagina {
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 20px;
        h1 { font-size: 24px; }
    }
    .botao-novo { width: 100%; }
    .corpo-secao { padding: 16px; }
    .titulo-secao { padding: 16px; }
}
</style>
