import { jsPDF } from 'jspdf';
import { normalizarRefeicaoPlano, type AlimentoNoPlano, type RefeicaoPlano } from '@/dados/planosSalvos';

export interface DadosPlanoParaPdf {
    paciente: string;
    objetivo: string;
    nutricionista: string;
    atualizadoEm: string;
    itens: RefeicaoPlano[];
}

function formatarNutriente(valor: number | null, unidade: string): string {
    return valor === null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${unidade}`;
}

function formatarPercentual(valor: number | null): string {
    return valor === null ? '—' : `${valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function somarNutriente(
    alimentos: AlimentoNoPlano[],
    campo: 'kcal' | 'proteina_g' | 'carboidrato_g' | 'lipideos_g'
): number | null {
    if (!alimentos.length || alimentos.some((alimento) => alimento[campo] === null)) {
        return null;
    }

    return alimentos.reduce((total, alimento) => total + ((alimento[campo] ?? 0) * alimento.quantidadeGramas) / 100, 0);
}

function calcularPercentualMacro(quantidade: number | null, fator: number, calorias: number | null): number | null {
    return calorias !== null && calorias > 0 && quantidade !== null ? (quantidade * fator * 100) / calorias : null;
}

function nomeDeArquivo(paciente: string): string {
    const slug = paciente
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLocaleLowerCase('pt-BR');

    return `plano-alimentar-${slug || 'paciente'}.pdf`;
}

/**
 * Gera e baixa um PDF pré-formatado do plano alimentar, seguindo o mesmo
 * padrão visual da página de compartilhamento com o paciente.
 */
export function gerarPdfPlano(dados: DadosPlanoParaPdf): void {
    const itens = dados.itens.map(normalizarRefeicaoPlano);
    const todosAlimentos = itens.reduce<AlimentoNoPlano[]>((todos, refeicao) => {
        todos.push(...refeicao.alimentos);
        return todos;
    }, []);

    const totais = {
        calorias: somarNutriente(todosAlimentos, 'kcal'),
        proteinas: somarNutriente(todosAlimentos, 'proteina_g'),
        carboidratos: somarNutriente(todosAlimentos, 'carboidrato_g'),
        gorduras: somarNutriente(todosAlimentos, 'lipideos_g')
    };

    const percentuais = {
        carboidratos: calcularPercentualMacro(totais.carboidratos, 4, totais.calorias),
        proteinas: calcularPercentualMacro(totais.proteinas, 4, totais.calorias),
        gorduras: calcularPercentualMacro(totais.gorduras, 9, totais.calorias)
    };

    const refeicoesVisiveis = itens.filter((refeicao) => refeicao.alimentos.length > 0 || refeicao.observacoes?.trim());

    const documento = new jsPDF({ format: 'a4', unit: 'mm' });
    const larguraPagina = 210;
    const margem = 12;
    const larguraConteudo = larguraPagina - margem * 2;
    const rodape = 285;
    let y = 0;

    const definirCorTexto = (cor: [number, number, number]) => documento.setTextColor(...cor);
    const adicionarCabecalhoPagina = () => {
        documento.setFont('helvetica', 'bold');
        documento.setFontSize(15);
        definirCorTexto([99, 91, 255]);
        documento.text('NutriPlanner', margem, 15);
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(9);
        definirCorTexto([123, 136, 147]);
        documento.text(`Plano alimentar · ${dados.paciente}`, larguraPagina - margem, 15, {
            align: 'right',
            maxWidth: larguraConteudo * 0.62
        });
        documento.setDrawColor(232, 237, 242);
        documento.line(margem, 20, larguraPagina - margem, 20);
        y = 27;
    };
    const adicionarPagina = () => {
        documento.addPage();
        adicionarCabecalhoPagina();
    };
    const adicionarDetalheRefeicao = (rotulo: string, texto: string) => {
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(8);
        const linhas = documento.splitTextToSize(texto.trim(), larguraConteudo - 8) as string[];
        let inicio = 0;

        while (inicio < linhas.length) {
            const linhasDisponiveis = Math.floor((rodape - y - 11) / 4.5);

            if (linhasDisponiveis < 1) {
                adicionarPagina();
                continue;
            }

            const segmento = linhas.slice(inicio, inicio + linhasDisponiveis);
            const alturaCartao = 10 + segmento.length * 4.5;
            arredondarCartao(margem, y, larguraConteudo, alturaCartao);
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(8);
            definirCorTexto([10, 37, 64]);
            documento.text(`${rotulo}${inicio > 0 ? ' (continuação)' : ''}`, margem + 4, y + 4.5);
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(8);
            definirCorTexto([82, 97, 112]);
            documento.text(segmento, margem + 4, y + 9);
            y += alturaCartao + 4;
            inicio += segmento.length;
        }
    };
    const arredondarCartao = (x: number, topo: number, largura: number, altura: number) => {
        documento.setDrawColor(232, 237, 242);
        documento.setFillColor(255, 255, 255);
        documento.roundedRect(x, topo, largura, altura, 3, 3, 'FD');
    };

    adicionarCabecalhoPagina();

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(9);
    definirCorTexto([99, 91, 255]);
    documento.text('PLANO ALIMENTAR', margem, y + 3);
    y += 12;
    documento.setFontSize(21);
    definirCorTexto([10, 37, 64]);
    const linhasPaciente = documento.splitTextToSize(dados.paciente, larguraConteudo * 0.75);
    documento.text(linhasPaciente, margem, y);
    y += linhasPaciente.length * 9 + 1;
    documento.setFont('helvetica', 'normal');
    documento.setFontSize(10);
    definirCorTexto([123, 136, 147]);
    const linhasObjetivo = documento.splitTextToSize(dados.objetivo, larguraConteudo);
    documento.text(linhasObjetivo, margem, y);
    y += linhasObjetivo.length * 5 + 6;

    if (dados.nutricionista.trim()) {
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(9);
        definirCorTexto([123, 136, 147]);
        documento.text(`Nutricionista responsável: ${dados.nutricionista.trim()}`, margem, y);
        y += 9;
    } else {
        y += 3;
    }

    const indicadores = [
        { rotulo: 'Calorias', valor: formatarNutriente(totais.calorias, 'kcal'), legenda: 'no plano' },
        {
            rotulo: 'Carboidratos',
            valor: formatarNutriente(totais.carboidratos, 'g'),
            legenda: `${formatarPercentual(percentuais.carboidratos)} da dieta`
        },
        {
            rotulo: 'Proteínas',
            valor: formatarNutriente(totais.proteinas, 'g'),
            legenda: `${formatarPercentual(percentuais.proteinas)} da dieta`
        },
        {
            rotulo: 'Gorduras',
            valor: formatarNutriente(totais.gorduras, 'g'),
            legenda: `${formatarPercentual(percentuais.gorduras)} da dieta`
        }
    ];
    const espacoIndicadores = 4;
    const larguraIndicador = (larguraConteudo - espacoIndicadores * 3) / 4;
    const alturaIndicador = 24;

    indicadores.forEach((indicador, indice) => {
        const x = margem + indice * (larguraIndicador + espacoIndicadores);
        arredondarCartao(x, y, larguraIndicador, alturaIndicador);
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(8);
        definirCorTexto([123, 136, 147]);
        documento.text(indicador.rotulo, x + 3, y + 7);
        documento.setFont('helvetica', 'bold');
        documento.setFontSize(10);
        definirCorTexto([10, 37, 64]);
        documento.text(indicador.valor, x + 3, y + 15, { maxWidth: larguraIndicador - 6 });
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(7);
        definirCorTexto([123, 136, 147]);
        documento.text(indicador.legenda, x + 3, y + 20.5, { maxWidth: larguraIndicador - 6 });
    });
    y += alturaIndicador + 11;

    documento.setFont('helvetica', 'bold');
    documento.setFontSize(14);
    definirCorTexto([10, 37, 64]);
    documento.text('Refeições do plano', margem, y + 4);
    documento.setFont('helvetica', 'normal');
    documento.setFontSize(9);
    definirCorTexto([123, 136, 147]);
    documento.text(
        `${refeicoesVisiveis.length} ${refeicoesVisiveis.length === 1 ? 'refeição' : 'refeições'}`,
        larguraPagina - margem,
        y + 4,
        { align: 'right' }
    );
    y += 10;

    const maximoLinhasAlimento = Math.min(50, Math.floor((rodape - 27 - 22) / 4.5));

    refeicoesVisiveis.forEach((refeicao) => {
        const alimentos: {
            alimento: AlimentoNoPlano;
            nomeLinhas: string[];
            altura: number;
            mostrarQuantidade: boolean;
        }[] = [];

        refeicao.alimentos.forEach((alimento) => {
            const nomeLinhas = documento.splitTextToSize(alimento.nome, larguraConteudo - 42);
            if (!nomeLinhas.length) {
                nomeLinhas.push('');
            }

            for (let inicio = 0; inicio < nomeLinhas.length; inicio += maximoLinhasAlimento) {
                const linhas = nomeLinhas.slice(inicio, inicio + maximoLinhasAlimento);
                alimentos.push({
                    alimento,
                    nomeLinhas: linhas,
                    altura: Math.max(10, linhas.length * 4.5 + 5),
                    mostrarQuantidade: inicio === 0
                });
            }
        });

        let indiceAlimento = 0;

        if (!alimentos.length) {
            const tituloLinhas = documento.splitTextToSize(
                [refeicao.horario, refeicao.nome].filter(Boolean).join('  '),
                larguraConteudo - 42
            );
            const alturaCabecalho = Math.max(13, tituloLinhas.length * 4.5 + 8);

            if (y + alturaCabecalho > rodape) {
                adicionarPagina();
            }

            arredondarCartao(margem, y, larguraConteudo, alturaCabecalho);
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(10);
            definirCorTexto([10, 37, 64]);
            documento.text(tituloLinhas, margem + 4, y + 6);
            y += alturaCabecalho + 5;
        }

        while (indiceAlimento < alimentos.length) {
            const continuacao = indiceAlimento > 0;
            const tituloRefeicao = [
                ...(refeicao.horario ? [refeicao.horario] : []),
                refeicao.nome,
                ...(continuacao ? ['(continuação)'] : [])
            ].join('  ');
            const tituloLinhas = documento.splitTextToSize(tituloRefeicao, larguraConteudo - 42);
            const alturaCabecalho = Math.max(13, tituloLinhas.length * 4.5 + 8);

            if (y + alturaCabecalho + alimentos[indiceAlimento].altura > rodape) {
                adicionarPagina();
                continue;
            }

            const alturaDisponivel = rodape - y - alturaCabecalho;
            let alturaAlimentos = 0;
            let fimSegmento = indiceAlimento;

            while (
                fimSegmento < alimentos.length &&
                (fimSegmento === indiceAlimento || alturaAlimentos + alimentos[fimSegmento].altura <= alturaDisponivel)
            ) {
                alturaAlimentos += alimentos[fimSegmento].altura;
                fimSegmento += 1;
            }

            const alturaCartao = alturaCabecalho + alturaAlimentos;
            arredondarCartao(margem, y, larguraConteudo, alturaCartao);
            documento.setFont('helvetica', 'bold');
            documento.setFontSize(10);
            definirCorTexto([10, 37, 64]);
            documento.text(tituloLinhas, margem + 4, y + 6);
            documento.setFont('helvetica', 'normal');
            documento.setFontSize(8);
            definirCorTexto([123, 136, 147]);
            documento.text(
                formatarNutriente(somarNutriente(refeicao.alimentos, 'kcal'), 'kcal'),
                larguraPagina - margem - 4,
                y + 8,
                { align: 'right' }
            );

            let yAlimento = y + alturaCabecalho;
            for (let indice = indiceAlimento; indice < fimSegmento; indice += 1) {
                const item = alimentos[indice];
                documento.setDrawColor(237, 240, 244);
                documento.line(margem + 4, yAlimento, larguraPagina - margem - 4, yAlimento);
                documento.setFont('helvetica', 'normal');
                documento.setFontSize(9);
                definirCorTexto([10, 37, 64]);
                documento.text(item.nomeLinhas, margem + 4, yAlimento + 5);
                documento.setFont('helvetica', 'bold');
                documento.setFontSize(9);
                if (item.mostrarQuantidade) {
                    documento.text(
                        `${item.alimento.quantidadeGramas.toLocaleString('pt-BR')} g`,
                        larguraPagina - margem - 4,
                        yAlimento + 5,
                        { align: 'right' }
                    );
                }
                yAlimento += item.altura;
            }

            indiceAlimento = fimSegmento;
            y += alturaCartao + 5;

            if (indiceAlimento < alimentos.length) {
                adicionarPagina();
            }
        }

        refeicao.alimentos.forEach((alimento) => {
            const substituicoes = [
                ...(alimento.descricaoSubstituicoes?.trim()
                    ? [`Descrição anterior: ${alimento.descricaoSubstituicoes.trim()}`]
                    : []),
                ...(alimento.substituicoes ?? []).map((substituto) => {
                    return `${substituto.nome} · ${substituto.quantidadeGramas.toLocaleString('pt-BR')} g`;
                })
            ];

            if (substituicoes.length) {
                adicionarDetalheRefeicao(`Substituições para ${alimento.nome}`, substituicoes.join('\n'));
            }
        });
        if (refeicao.observacoes?.trim()) {
            adicionarDetalheRefeicao('Observações', refeicao.observacoes);
        }
    });

    const totalPaginas = documento.getNumberOfPages();
    for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        documento.setPage(pagina);
        documento.setFont('helvetica', 'normal');
        documento.setFontSize(8);
        definirCorTexto([123, 136, 147]);
        documento.text(`Atualizado ${dados.atualizadoEm} · ${pagina}/${totalPaginas}`, larguraPagina / 2, 289, {
            align: 'center'
        });
    }

    documento.save(nomeDeArquivo(dados.paciente));
}
