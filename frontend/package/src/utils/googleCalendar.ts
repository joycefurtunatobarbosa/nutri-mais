import type { DadosAgendamento } from '@/dados/agendamentos';

const ESCOPO = 'https://www.googleapis.com/auth/calendar.events';
const API_EVENTOS = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const URL_GIS = 'https://accounts.google.com/gsi/client';
const FUSO = Intl.DateTimeFormat().resolvedOptions().timeZone;

interface RespostaToken {
    access_token?: string;
    expires_in?: number;
    error?: string;
}

interface ClienteToken {
    requestAccessToken: (opcoes?: { prompt?: string }) => void;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                oauth2: {
                    initTokenClient: (config: {
                        client_id: string;
                        scope: string;
                        callback: (resposta: RespostaToken) => void;
                        error_callback?: (erro: { type: string }) => void;
                    }) => ClienteToken;
                    revoke: (token: string, callback?: () => void) => void;
                };
            };
        };
    }
}

// O token fica apenas em memória e expira sozinho.
let token: string | null = null;
let expiraEm = 0;

export const clientIdGoogle: string = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ?? '';

export const googleConfigurado = () => clientIdGoogle !== '';
export const googleConectado = () => token !== null && Date.now() < expiraEm;

function carregarScript(): Promise<void> {
    if (window.google?.accounts) return Promise.resolve();
    return new Promise((resolve, reject) => {
        const existente = document.querySelector<HTMLScriptElement>(`script[src="${URL_GIS}"]`);
        const script = existente ?? document.createElement('script');
        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () => reject(new Error('Não foi possível carregar o Google Identity Services.')));
        if (!existente) {
            script.src = URL_GIS;
            script.async = true;
            document.head.appendChild(script);
        }
    });
}

export async function conectarGoogle(): Promise<void> {
    if (!googleConfigurado()) {
        throw new Error('Defina VITE_GOOGLE_CLIENT_ID no arquivo .env para conectar ao Google Agenda.');
    }
    await carregarScript();
    await new Promise<void>((resolve, reject) => {
        const cliente = window.google!.accounts.oauth2.initTokenClient({
            client_id: clientIdGoogle,
            scope: ESCOPO,
            callback: (resposta) => {
                if (resposta.error || !resposta.access_token) {
                    reject(new Error('A autorização do Google Agenda foi negada.'));
                    return;
                }
                token = resposta.access_token;
                expiraEm = Date.now() + (resposta.expires_in ?? 3600) * 1000 - 30000;
                resolve();
            },
            error_callback: () => reject(new Error('A janela de autorização do Google foi fechada.'))
        });
        cliente.requestAccessToken({ prompt: googleConectado() ? '' : 'consent' });
    });
}

export function desconectarGoogle(): void {
    if (token) window.google?.accounts.oauth2.revoke(token);
    token = null;
    expiraEm = 0;
}

async function requisitar(url: string, metodo: string, corpo?: unknown): Promise<Response> {
    if (!googleConectado()) await conectarGoogle();
    const resposta = await fetch(url, {
        method: metodo,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: corpo ? JSON.stringify(corpo) : undefined
    });
    if (!resposta.ok && resposta.status !== 404 && resposta.status !== 410) {
        throw new Error(`Falha ao comunicar com o Google Agenda (${resposta.status}).`);
    }
    return resposta;
}

function montarEvento(a: DadosAgendamento) {
    return {
        summary: `${a.tipo} — ${a.paciente}`,
        description: a.observacoes,
        start: { dateTime: `${a.data}T${a.horaInicio}:00`, timeZone: FUSO },
        end: { dateTime: `${a.data}T${a.horaFim}:00`, timeZone: FUSO },
        status: a.status === 'Cancelado' ? 'cancelled' : 'confirmed'
    };
}

export async function criarEventoGoogle(a: DadosAgendamento): Promise<{ id: string; link: string }> {
    const resposta = await requisitar(API_EVENTOS, 'POST', montarEvento(a));
    const evento = await resposta.json();
    return { id: evento.id, link: evento.htmlLink };
}

export async function atualizarEventoGoogle(eventId: string, a: DadosAgendamento): Promise<{ id: string; link: string } | null> {
    const resposta = await requisitar(`${API_EVENTOS}/${encodeURIComponent(eventId)}`, 'PUT', montarEvento(a));
    if (resposta.status === 404 || resposta.status === 410) return criarEventoGoogle(a);
    const evento = await resposta.json();
    return { id: evento.id, link: evento.htmlLink };
}

export async function excluirEventoGoogle(eventId: string): Promise<void> {
    await requisitar(`${API_EVENTOS}/${encodeURIComponent(eventId)}`, 'DELETE');
}
