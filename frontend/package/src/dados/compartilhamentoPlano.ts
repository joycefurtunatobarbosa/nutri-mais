import type { AlimentoSubstituto, AlimentoNoPlano, RefeicaoPlano } from './planosSalvos';
import type { Alimento } from './alimentos';

export interface PlanoPacienteCompartilhado {
    paciente: string;
    objetivo: string;
    nutricionista: string;
    calorias: number | null;
    refeicoes: number;
    atualizadoEm: string;
    itens: RefeicaoPlano[];
}

interface PlanoCriptografado {
    versao: 1;
    salt: string;
    iv: string;
    conteudo: string;
}

const ITERACOES_PBKDF2 = 310_000;
const CONTEXTO_CRIPTOGRAFIA = new TextEncoder().encode('nutri-planner:plano-compartilhado:v1');
const codificador = new TextEncoder();
const decodificador = new TextDecoder();

function bytesParaBase64Url(bytes: Uint8Array): string {
    let binario = '';

    for (let inicio = 0; inicio < bytes.length; inicio += 0x8000) {
        binario += String.fromCharCode(...bytes.subarray(inicio, inicio + 0x8000));
    }

    return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlParaBytes(valor: string): Uint8Array {
    const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
    const preenchimento = '='.repeat((4 - (base64.length % 4)) % 4);
    const binario = atob(base64 + preenchimento);

    return Uint8Array.from(binario, (caractere) => caractere.charCodeAt(0));
}

async function derivarChave(senha: string, salt: Uint8Array): Promise<CryptoKey> {
    const material = await crypto.subtle.importKey('raw', codificador.encode(senha), 'PBKDF2', false, ['deriveKey']);

    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: ITERACOES_PBKDF2, hash: 'SHA-256' },
        material,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

function isRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function isNumeroOpcional(valor: unknown): valor is number | null {
    return valor === null || (typeof valor === 'number' && Number.isFinite(valor));
}

function isAlimento(valor: unknown): valor is Alimento {
    if (!isRegistro(valor)) {
        return false;
    }

    return (
        typeof valor.id === 'string' &&
        typeof valor.nome === 'string' &&
        (typeof valor.grupo === 'string' || valor.grupo === null) &&
        (valor.fonte === 'TACO' || valor.fonte === 'Tucunduva' || valor.fonte === 'Personalizado') &&
        isNumeroOpcional(valor.kcal) &&
        isNumeroOpcional(valor.proteina_g) &&
        isNumeroOpcional(valor.lipideos_g) &&
        isNumeroOpcional(valor.carboidrato_g) &&
        isNumeroOpcional(valor.fibra_g)
    );
}

function isAlimentoSubstituto(valor: unknown): valor is AlimentoSubstituto {
    return (
        isRegistro(valor) &&
        isAlimento(valor) &&
        typeof valor.quantidadeGramas === 'number' &&
        Number.isFinite(valor.quantidadeGramas) &&
        valor.quantidadeGramas > 0
    );
}

function isAlimentoNoPlano(valor: unknown): valor is AlimentoNoPlano {
    return (
        isRegistro(valor) &&
        isAlimento(valor) &&
        typeof valor.quantidadeGramas === 'number' &&
        Number.isFinite(valor.quantidadeGramas) &&
        valor.quantidadeGramas > 0 &&
        (valor.substituicoes === undefined ||
            typeof valor.substituicoes === 'string' ||
            (Array.isArray(valor.substituicoes) && valor.substituicoes.every(isAlimentoSubstituto))) &&
        (valor.descricaoSubstituicoes === undefined || typeof valor.descricaoSubstituicoes === 'string')
    );
}

function isRefeicao(valor: unknown): valor is RefeicaoPlano {
    return (
        isRegistro(valor) &&
        typeof valor.nome === 'string' &&
        (valor.horario === undefined || typeof valor.horario === 'string') &&
        (valor.substituicoes === undefined || typeof valor.substituicoes === 'string') &&
        (valor.observacoes === undefined || typeof valor.observacoes === 'string') &&
        Array.isArray(valor.alimentos) &&
        valor.alimentos.every(isAlimentoNoPlano)
    );
}

function isPlanoPaciente(valor: unknown): valor is PlanoPacienteCompartilhado {
    return (
        isRegistro(valor) &&
        typeof valor.paciente === 'string' &&
        typeof valor.objetivo === 'string' &&
        typeof valor.nutricionista === 'string' &&
        isNumeroOpcional(valor.calorias) &&
        typeof valor.refeicoes === 'number' &&
        Number.isFinite(valor.refeicoes) &&
        typeof valor.atualizadoEm === 'string' &&
        Array.isArray(valor.itens) &&
        valor.itens.every(isRefeicao)
    );
}

export async function criptografarPlano(plano: PlanoPacienteCompartilhado, senha: string): Promise<string> {
    if (!/^\d{5}$/.test(senha)) {
        throw new Error('A senha precisa ter 5 dígitos.');
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const chave = await derivarChave(senha, salt);
    const conteudo = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv, additionalData: CONTEXTO_CRIPTOGRAFIA },
        chave,
        codificador.encode(JSON.stringify(plano))
    );
    const compartilhamento: PlanoCriptografado = {
        versao: 1,
        salt: bytesParaBase64Url(salt),
        iv: bytesParaBase64Url(iv),
        conteudo: bytesParaBase64Url(new Uint8Array(conteudo))
    };

    return bytesParaBase64Url(codificador.encode(JSON.stringify(compartilhamento)));
}

export async function descriptografarPlano(token: string, senha: string): Promise<PlanoPacienteCompartilhado> {
    const valor: unknown = JSON.parse(decodificador.decode(base64UrlParaBytes(token)));

    if (
        !isRegistro(valor) ||
        valor.versao !== 1 ||
        typeof valor.salt !== 'string' ||
        typeof valor.iv !== 'string' ||
        typeof valor.conteudo !== 'string'
    ) {
        throw new Error('O link protegido está inválido.');
    }

    const chave = await derivarChave(senha, base64UrlParaBytes(valor.salt));
    const conteudo = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: base64UrlParaBytes(valor.iv),
            additionalData: CONTEXTO_CRIPTOGRAFIA
        },
        chave,
        base64UrlParaBytes(valor.conteudo)
    );
    const plano: unknown = JSON.parse(decodificador.decode(conteudo));

    if (!isPlanoPaciente(plano)) {
        throw new Error('O conteúdo do plano está inválido.');
    }

    return plano;
}
