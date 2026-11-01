<script setup lang="ts">
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue';
import { descriptografarPlano, type PlanoPacienteCompartilhado } from '@/dados/compartilhamentoPlano';
import { normalizarRefeicaoPlano, type AlimentoNoPlano } from '@/dados/planosSalvos';

const token = new URLSearchParams(window.location.hash.slice(1)).get('plano');
const senha = ref('');
const plano = ref<PlanoPacienteCompartilhado | null>(null);
const erro = ref('');
const abrindo = ref(false);
const gerandoPdf = ref(false);
const refeicoesVisiveis = computed(
    () =>
        plano.value?.itens.filter(
            (refeicao) =>
                refeicao.alimentos.length > 0 || refeicao.observacoes?.trim()
        ) ?? []
);

const totais = computed(() => {
    if (!plano.value) {
        return { calorias: null, proteinas: null, carboidratos: null, gorduras: null };
    }

    const alimentos = plano.value.itens.reduce<AlimentoNoPlano[]>((todos, refeicao) => {
        todos.push(...refeicao.alimentos);
        return todos;
    }, []);
    const somar = (campo: 'kcal' | 'proteina_g' | 'carboidrato_g' | 'lipideos_g'): number | null => {
        if (alimentos.some((alimento) => alimento[campo] === null)) {
            return null;
        }

        return alimentos.reduce(
            (total, alimento) => total + ((alimento[campo] ?? 0) * alimento.quantidadeGramas) / 100,
            0
        );
    };

    return {
        calorias: somar('kcal'),
        proteinas: somar('proteina_g'),
        carboidratos: somar('carboidrato_g'),
        gorduras: somar('lipideos_g')
    };
});

function formatarNutriente(valor: number | null, unidade: string): string {
    return valor === null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unidade}`;
}

function formatarPercentual(valor: number | null): string {
    return valor === null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function calcularPercentualMacro(quantidade: number | null, fator: number): number | null {
    const calorias = totais.value.calorias;

    return calorias !== null && calorias > 0 && quantidade !== null ? (quantidade * fator * 100) / calorias : null;
}

const percentuais = computed(() => ({
    carboidratos: calcularPercentualMacro(totais.value.carboidratos, 4),
    proteinas: calcularPercentualMacro(totais.value.proteinas, 4),
    gorduras: calcularPercentualMacro(totais.value.gorduras, 9)
}));

function caloriasDaRefeicao(alimentos: AlimentoNoPlano[]): number | null {
    if (alimentos.some((alimento) => alimento.kcal === null)) {
        return null;
    }

    return alimentos.reduce(
        (total, alimento) => total + ((alimento.kcal ?? 0) * alimento.quantidadeGramas) / 100,
        0
    );
}

async function gerarPdf() {
    if (!plano.value) {
        return;
    }

    gerandoPdf.value = true;
    erro.value = '';

    try {
        const { gerarPdfPlano } = await import('@/utils/gerarPdfPlano');
        gerarPdfPlano({
            paciente: plano.value.paciente,
            objetivo: plano.value.objetivo,
            nutricionista: plano.value.nutricionista,
            atualizadoEm: plano.value.atualizadoEm,
            itens: plano.value.itens
        });
    } catch (falha) {
        console.error('Não foi possível gerar o PDF do plano.', falha);
        erro.value = 'Não foi possível gerar o PDF do plano. Tente novamente.';
    } finally {
        gerandoPdf.value = false;
    }
}

async function abrirPlano() {
    if (!token) {
        erro.value = 'Este link não contém um plano válido.';
        return;
    }

    if (!senha.value) {
        erro.value = 'Informe a senha para abrir o plano.';
        return;
    }

    abrindo.value = true;
    erro.value = '';

    try {
        const planoDescriptografado = await descriptografarPlano(token, senha.value);
        plano.value = {
            ...planoDescriptografado,
            itens: planoDescriptografado.itens.map(normalizarRefeicaoPlano)
        };
        senha.value = '';
    } catch (falha) {
        console.error('Não foi possível abrir o plano compartilhado.', falha);
        erro.value = 'Não foi possível abrir o plano. Confira a senha e o link recebido.';
    } finally {
        abrindo.value = false;
    }
}
</script>

<template>
    <main class="pagina-compartilhada">
        <header class="cabecalho-paciente">
            <div class="marca"><Icon icon="solar:heart-pulse-linear" width="23" /> NutriMais</div>
            <span>Plano alimentar do paciente</span>
        </header>

        <section v-if="!plano" class="cartao-acesso">
            <div class="icone-acesso"><Icon icon="solar:lock-keyhole-linear" width="27" /></div>
            <h1>Acesse seu plano alimentar</h1>
            <p>Informe a senha recebida do seu nutricionista para visualizar o plano.</p>
            <v-alert v-if="erro" type="error" variant="tonal" class="mb-5">{{ erro }}</v-alert>
            <v-form @submit.prevent="abrirPlano">
                <v-text-field
                    v-model="senha"
                    label="Senha do plano"
                    type="text"
                    inputmode="numeric"
                    maxlength="5"
                    autocomplete="off"
                    @update:model-value="senha = String($event ?? '').replace(/\D/g, '').slice(0, 5)"
                    variant="outlined"
                    autofocus
                />
                <v-btn type="submit" color="primary" block size="large" :loading="abrindo">
                    Abrir plano
                </v-btn>
            </v-form>
            <div class="nota-privacidade"><Icon icon="solar:shield-check-linear" width="17" /> Seus dados são protegidos por senha.</div>
        </section>

        <section v-else class="conteudo-plano">
            <div class="titulo-plano">
                <div>
                    <span class="sobretitulo">Plano alimentar</span>
                    <h1>{{ plano.paciente }}</h1>
                    <p>{{ plano.objetivo }}</p>
                    <p class="nutricionista-responsavel">
                        <Icon icon="solar:user-id-linear" width="15" class="me-1" />
                        Nutricionista responsável: <strong>{{ plano.nutricionista }}</strong>
                    </p>
                </div>
                <div class="acoes-plano">
                    <v-btn class="botao-pdf" color="primary" variant="tonal" :loading="gerandoPdf" @click="gerarPdf">
                        <Icon icon="solar:download-linear" width="18" class="me-2" />
                        Gerar PDF
                    </v-btn>
                    <v-chip color="success" variant="tonal"><Icon icon="solar:eye-linear" width="16" class="me-1" /> Somente leitura</v-chip>
                </div>
            </div>

            <v-alert v-if="erro" type="error" variant="tonal" class="mb-5">{{ erro }}</v-alert>

            <section class="resumo-plano" aria-label="Resumo nutricional do plano">
                <article><span>Calorias</span><strong>{{ formatarNutriente(totais.calorias, 'kcal') }}</strong></article>
                <article>
                    <span>Carboidratos</span><strong>{{ formatarNutriente(totais.carboidratos, 'g') }}</strong>
                    <small>{{ formatarPercentual(percentuais.carboidratos) }} da dieta</small>
                </article>
                <article>
                    <span>Proteínas</span><strong>{{ formatarNutriente(totais.proteinas, 'g') }}</strong>
                    <small>{{ formatarPercentual(percentuais.proteinas) }} da dieta</small>
                </article>
                <article>
                    <span>Gorduras</span><strong>{{ formatarNutriente(totais.gorduras, 'g') }}</strong>
                    <small>{{ formatarPercentual(percentuais.gorduras) }} da dieta</small>
                </article>
            </section>


            <div class="cabecalho-refeicoes">
                <div><h2>Suas refeições</h2><p>Alimentos e porções recomendadas</p></div>
                <span>{{ refeicoesVisiveis.length }} {{ refeicoesVisiveis.length === 1 ? 'refeição' : 'refeições' }}</span>
            </div>

            <v-card
                v-for="refeicao in refeicoesVisiveis"
                :key="refeicao.nome"
                class="cartao-refeicao"
                elevation="0"
            >
                <div class="titulo-refeicao">
                    <h3><span v-if="refeicao.horario" class="horario-refeicao">{{ refeicao.horario }}</span>{{ refeicao.nome }}</h3>
                    <span>{{ formatarNutriente(caloriasDaRefeicao(refeicao.alimentos), 'kcal') }}</span>
                </div>
                <div v-for="alimento in refeicao.alimentos" :key="alimento.id" class="alimento-compartilhado">
                    <div class="linha-alimento">
                        <div><strong>{{ alimento.nome }}</strong></div>
                        <strong>{{ alimento.quantidadeGramas.toLocaleString('pt-BR') }} g</strong>
                    </div>
                    <div v-if="alimento.descricaoSubstituicoes?.trim()" class="detalhe-refeicao">
                        <strong>Descrição anterior da substituição</strong>
                        <p>{{ alimento.descricaoSubstituicoes }}</p>
                    </div>
                    <div v-if="alimento.substituicoes?.length" class="detalhe-refeicao substituicoes-estruturadas">
                        <strong>Alimentos para substituição</strong>
                        <article v-for="(substituto, indice) in alimento.substituicoes" :key="`${substituto.id}-${indice}`">
                            <div class="linha-alimento">
                                <span><strong>{{ substituto.nome }}</strong></span>
                                <strong>{{ substituto.quantidadeGramas.toLocaleString('pt-BR') }} g</strong>
                            </div>
                        </article>
                    </div>
                </div>
                <div v-if="refeicao.observacoes?.trim()" class="detalhe-refeicao">
                    <strong>Observações</strong>
                    <p>{{ refeicao.observacoes }}</p>
                </div>
            </v-card>

            <p class="rodape-plano">Compartilhado em modo de leitura · Atualizado {{ plano.atualizadoEm }}</p>
        </section>
    </main>
</template>

<style scoped lang="scss">
.pagina-compartilhada { min-height: 100vh; padding: 28px 20px 56px; color: #0a2540; background: #f7f9fc; }
.cabecalho-paciente { display: flex; max-width: 920px; align-items: center; justify-content: space-between; margin: 0 auto 34px; color: #7b8893; font-size: 13px; }
.marca { display: flex; align-items: center; gap: 9px; color: #635bff; font-size: 18px; font-weight: 700; }
.cartao-acesso { max-width: 460px; margin: 8vh auto 0; padding: 34px; border: 1px solid #e8edf2; border-radius: 16px; background: white; box-shadow: 0 12px 35px rgb(10 37 64 / 5%); text-align: center; }
.icone-acesso { display: grid; width: 58px; height: 58px; place-items: center; margin: 0 auto 18px; border-radius: 16px; color: #635bff; background: #f0efff; }
.cartao-acesso h1, .titulo-plano h1 { margin: 0; font-size: 25px; font-weight: 700; letter-spacing: -0.4px; }
.cartao-acesso > p { margin: 10px 0 26px; color: #7b8893; font-size: 14px; line-height: 1.6; }
.nota-privacidade { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 20px; color: #7b8893; font-size: 12px; }
.conteudo-plano { max-width: 920px; margin: 0 auto; }
.titulo-plano { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px; }
.acoes-plano { display: flex; align-items: center; gap: 12px; }
.sobretitulo { color: #635bff; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; }
.titulo-plano h1 { margin-top: 7px; }
.titulo-plano p { margin: 5px 0 0; color: #7b8893; }
.nutricionista-responsavel { display: flex; align-items: center; margin-top: 10px !important; color: #526170; font-size: 13px; }
.nutricionista-responsavel strong { margin-left: 4px; color: #0a2540; }
.resumo-plano { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 34px; }
.resumo-plano article { display: flex; min-height: 92px; flex-direction: column; justify-content: center; gap: 6px; padding: 16px; border: 1px solid #e8edf2; border-radius: 12px; background: white; }
.resumo-plano span { color: #7b8893; font-size: 12px; }
.resumo-plano strong { font-size: 18px; }
.resumo-plano small { color: #7b8893; font-size: 11px; }
.cabecalho-refeicoes { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 14px; }
.cabecalho-refeicoes h2 { margin: 0; font-size: 19px; }
.cabecalho-refeicoes p { margin: 5px 0 0; color: #7b8893; font-size: 13px; }
.cabecalho-refeicoes > span { color: #7b8893; font-size: 13px; }
.cartao-refeicao { margin-bottom: 14px; padding: 18px 20px; border: 1px solid #e8edf2; border-radius: 12px; background: white; }
.titulo-refeicao, .linha-alimento { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.titulo-refeicao { padding-bottom: 12px; border-bottom: 1px solid #edf0f4; }
.titulo-refeicao h3 { margin: 0; font-size: 15px; }
.titulo-refeicao h3 .horario-refeicao { display: inline-block; margin-right: 10px; padding: 2px 8px; border-radius: 6px; background: #eef4ff; color: #1e5eff; font-size: 12px; font-weight: 700; }
.titulo-refeicao span { color: #7b8893; font-size: 12px; }
.linha-alimento { padding-top: 13px; font-size: 13px; }
.alimento-compartilhado + .alimento-compartilhado { margin-top: 12px; border-top: 1px solid #edf0f4; }
.alimento-compartilhado + .alimento-compartilhado .linha-alimento { padding-top: 12px; }
.linha-alimento div { display: flex; flex-direction: column; gap: 3px; }
.linha-alimento div span { color: #7b8893; font-size: 11px; }
.detalhe-refeicao { margin-top: 14px; padding-top: 12px; border-top: 1px solid #edf0f4; }
.detalhe-refeicao strong { font-size: 12px; }
.detalhe-refeicao p { margin: 5px 0 0; color: #526170; font-size: 13px; line-height: 1.5; white-space: pre-line; }
.substituicoes-estruturadas > article { padding: 8px 0; border-top: 1px solid #f0f2f5; }
.substituicoes-estruturadas .linha-alimento { padding-top: 0; }
.substituicoes-estruturadas .linha-alimento strong { color: #34495c; font-size: 13px; }
.nutrientes-item-refeicao { display: flex; flex-wrap: wrap; gap: 4px 10px; margin-top: 5px; }
.nutrientes-item-refeicao span { color: #7b8893; font-size: 11px; }
.rodape-plano { margin-top: 22px; color: #7b8893; font-size: 12px; text-align: center; }
@media (max-width: 650px) {
    .pagina-compartilhada { padding: 22px 14px 40px; }
    .cabecalho-paciente { margin-bottom: 24px; }
    .cartao-acesso { margin-top: 5vh; padding: 26px 20px; }
    .titulo-plano { align-items: flex-start; flex-direction: column; }
    .acoes-plano { align-items: flex-start; flex-direction: column; }
    .resumo-plano { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .cartao-refeicao { padding: 16px; }
}
</style>
