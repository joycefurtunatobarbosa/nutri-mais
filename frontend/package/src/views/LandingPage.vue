<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const menuAberto = ref(false);
</script>

<template>
    <!-- <main class="landing-page">
        <header class="site-header">
            <div class="container header-content">
                <RouterLink class="brand" to="/" aria-label="NutriMais — início">
                    <span class="brand-mark">N</span>
                    <span>Nutri<span class="brand-accent">Mais</span></span>
                </RouterLink>

                <button
                    class="menu-toggle"
                    type="button"
                    :aria-expanded="menuAberto"
                    aria-label="Abrir menu"
                    @click="menuAberto = !menuAberto"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav class="navigation" :class="{ 'navigation-open': menuAberto }" aria-label="Navegação principal">
                    <a href="#recursos" @click="menuAberto = false">Recursos</a>
                    <a href="#como-funciona" @click="menuAberto = false">Como funciona</a>
                    <RouterLink class="login-link" to="/auth/login">Entrar</RouterLink>
                    <RouterLink class="button button-small" to="/auth/register">Começar grátis</RouterLink>
                </nav>
            </div>
        </header>

        <section class="hero">
            <div class="container hero-grid">
                <div class="hero-copy">
                    <div class="eyebrow"><span class="eyebrow-dot"></span> Cuidado nutricional, sem complicação</div>
                    <h1>Mais tempo para cuidar. <span>Mais leveza para planejar.</span></h1>
                    <p class="hero-description">
                        Crie planos alimentares personalizados, acompanhe seus pacientes e deixe a rotina do consultório
                        mais simples — tudo em um só lugar.
                    </p>
                    <div class="hero-actions">
                        <RouterLink class="button" to="/auth/register">
                            Experimente grátis <span aria-hidden="true">→</span>
                        </RouterLink>
                        <a class="text-link" href="#como-funciona">Conheça a plataforma</a>
                    </div>
                    <div class="hero-note">
                        <span class="note-check" aria-hidden="true">✓</span>
                        Feito para a rotina de nutricionistas
                    </div>
                </div>

                <div class="hero-visual" aria-label="Prévia do painel NutriMais">
                    <div class="visual-orbit orbit-one"></div>
                    <div class="visual-orbit orbit-two"></div>
                    <div class="dashboard-preview">
                        <div class="preview-topbar">
                            <div class="preview-brand"><span class="preview-logo">N</span> NutriMais</div>
                            <div class="preview-avatar">JC</div>
                        </div>
                        <div class="preview-content">
                            <div class="preview-heading">
                                <div>
                                    <span class="preview-overline">QUARTA-FEIRA, 29 DE OUTUBRO</span>
                                    <h2>Bom dia, Juliana 👋</h2>
                                    <p>Veja como está sua rotina hoje.</p>
                                </div>
                                <span class="preview-pill">● Tudo em dia</span>
                            </div>
                            <div class="preview-stats">
                                <div class="stat-card">
                                    <span>Pacientes ativos</span>
                                    <strong>24</strong>
                                    <small>+3 neste mês</small>
                                </div>
                                <div class="stat-card">
                                    <span>Planos criados</span>
                                    <strong>18</strong>
                                    <small>5 aguardando revisão</small>
                                </div>
                            </div>
                            <div class="meal-card">
                                <div class="meal-card-heading">
                                    <div>
                                        <span class="preview-overline">PLANO ALIMENTAR</span>
                                        <h3>Rotina equilibrada</h3>
                                    </div>
                                    <span class="meal-status">Personalizado</span>
                                </div>
                                <div class="meal-row">
                                    <span class="meal-icon breakfast">☀</span>
                                    <div><strong>Café da manhã</strong><small>7h30 · 3 alimentos</small></div>
                                    <span class="meal-calories">320 kcal</span>
                                </div>
                                <div class="meal-row">
                                    <span class="meal-icon lunch">◒</span>
                                    <div><strong>Almoço</strong><small>12h30 · 4 alimentos</small></div>
                                    <span class="meal-calories">540 kcal</span>
                                </div>
                                <div class="meal-row">
                                    <span class="meal-icon snack">✳</span>
                                    <div><strong>Lanche da tarde</strong><small>16h · 2 alimentos</small></div>
                                    <span class="meal-calories">210 kcal</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="floating-note"><span class="floating-check">✓</span><span><strong>Plano pronto!</strong><small>Mais tempo para você</small></span></div>
                    <span class="decorative-leaf leaf-one" aria-hidden="true">✳</span>
                    <span class="decorative-leaf leaf-two" aria-hidden="true">✦</span>
                </div>
            </div>
        </section>

        <section id="recursos" class="features section">
            <div class="container">
                <div class="section-heading">
                    <span class="eyebrow">SUA ROTINA, MAIS SIMPLES</span>
                    <h2>O que você precisa para cuidar melhor</h2>
                    <p>Menos tempo com tarefas repetitivas. Mais presença em cada acompanhamento.</p>
                </div>
                <div class="feature-grid">
                    <article class="feature-card">
                        <span class="feature-icon icon-green" aria-hidden="true">✎</span>
                        <h3>Planos personalizados</h3>
                        <p>Monte planos alimentares com praticidade e adapte cada refeição às necessidades do paciente.</p>
                        <a href="#como-funciona">Saiba mais <span aria-hidden="true">→</span></a>
                    </article>
                    <article class="feature-card">
                        <span class="feature-icon icon-yellow" aria-hidden="true">♡</span>
                        <h3>Acompanhamento próximo</h3>
                        <p>Organize as informações dos seus pacientes e tenha o histórico sempre à mão.</p>
                        <a href="#como-funciona">Saiba mais <span aria-hidden="true">→</span></a>
                    </article>
                    <article class="feature-card">
                        <span class="feature-icon icon-lilac" aria-hidden="true">↗</span>
                        <h3>Mais tempo para você</h3>
                        <p>Uma rotina organizada ajuda você a dedicar sua energia ao que realmente importa: pessoas.</p>
                        <a href="#como-funciona">Saiba mais <span aria-hidden="true">→</span></a>
                    </article>
                </div>
            </div>
        </section>

        <section id="como-funciona" class="steps-section section">
            <div class="container steps-grid">
                <div class="steps-copy">
                    <span class="eyebrow">SIMPLES DESDE O PRIMEIRO ACESSO</span>
                    <h2>Seu cuidado, organizado em poucos passos.</h2>
                    <p>Uma plataforma intuitiva para acompanhar a jornada de cada paciente com mais clareza.</p>
                    <RouterLink class="button" to="/auth/register">Comece agora <span aria-hidden="true">→</span></RouterLink>
                </div>
                <div class="steps-list">
                    <article class="step-item">
                        <span class="step-number">01</span>
                        <div><h3>Cadastre seus pacientes</h3><p>Centralize os dados importantes e mantenha tudo organizado.</p></div>
                    </article>
                    <article class="step-item">
                        <span class="step-number">02</span>
                        <div><h3>Crie planos do seu jeito</h3><p>Monte uma rotina alimentar personalizada para cada objetivo.</p></div>
                    </article>
                    <article class="step-item">
                        <span class="step-number">03</span>
                        <div><h3>Acompanhe a evolução</h3><p>Tenha mais praticidade para revisar e ajustar o plano sempre que precisar.</p></div>
                    </article>
                </div>
            </div>
        </section>

        <section class="final-cta">
            <div class="container cta-content">
                <div>
                    <span class="eyebrow">SEU CONSULTÓRIO MERECE ESSA LEVEZA</span>
                    <h2>Pronto para transformar sua rotina?</h2>
                    <p>Comece a organizar seus planos e pacientes com o NutriMais.</p>
                </div>
                <RouterLink class="button button-light" to="/auth/register">Criar minha conta <span aria-hidden="true">→</span></RouterLink>
            </div>
        </section>

        <footer class="site-footer">
            <div class="container footer-content">
                <RouterLink class="brand" to="/" aria-label="NutriMais — início">
                    <span class="brand-mark">N</span>
                    <span>Nutri<span class="brand-accent">Mais</span></span>
                </RouterLink>
                <p>Mais leveza na rotina. Mais cuidado em cada escolha.</p>
                <span>© {{ new Date().getFullYear() }} NutriMais</span>
            </div>
        </footer>
    </main> -->
</template>

<style scoped>
.landing-page {
    --ink: #183e34;
    --ink-soft: #48635a;
    --muted: #78877f;
    --green: #2f7259;
    --green-dark: #205841;
    --green-light: #edf5ef;
    --lime: #d3ec9b;
    --cream: #fafbf7;
    color: var(--ink);
    background: #fff;
    font-family: 'Manrope', sans-serif;
}

.landing-page * { box-sizing: border-box; }
.container { width: min(1120px, calc(100% - 48px)); margin: 0 auto; }
.site-header { position: relative; z-index: 5; background: #fff; }
.header-content { min-height: 82px; display: flex; align-items: center; justify-content: space-between; }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); text-decoration: none; font-size: 19px; font-weight: 800; letter-spacing: -0.8px; }
.brand-mark { display: grid; width: 36px; height: 36px; place-items: center; border-radius: 12px; background: var(--green); color: #fff; font-size: 18px; letter-spacing: 0; }
.brand-accent { color: var(--green); }
.navigation { display: flex; align-items: center; gap: 34px; }
.navigation a, .text-link { color: var(--ink-soft); text-decoration: none; font-size: 13px; font-weight: 700; transition: color .2s ease; }
.navigation a:hover, .text-link:hover { color: var(--green); }
.navigation .login-link { color: var(--ink); }
.button { display: inline-flex; min-height: 50px; align-items: center; justify-content: center; gap: 13px; padding: 0 23px; border: 1px solid var(--green); border-radius: 8px; background: var(--green); color: #fff; text-decoration: none; font-size: 13px; font-weight: 800; box-shadow: 0 8px 18px rgb(47 114 89 / 14%); transition: transform .2s ease, background .2s ease; }
.button:hover { transform: translateY(-2px); background: var(--green-dark); color: #fff; }
.button-small { min-height: 42px; padding: 0 17px; }
.menu-toggle { display: none; }

.hero { position: relative; overflow: hidden; padding: 76px 0 92px; background: var(--cream); }
.hero::before { position: absolute; top: -245px; right: -120px; width: 610px; height: 610px; border: 1px solid #e8eee5; border-radius: 50%; content: ''; }
.hero-grid { position: relative; display: grid; grid-template-columns: .92fr 1.08fr; align-items: center; gap: 38px; }
.hero-copy { position: relative; z-index: 2; padding: 10px 0 28px; }
.eyebrow { display: inline-flex; align-items: center; gap: 9px; color: var(--green); font-size: 10px; font-weight: 800; letter-spacing: 1.45px; text-transform: uppercase; }
.eyebrow-dot { width: 7px; height: 7px; border-radius: 50%; background: #86b88a; box-shadow: 0 0 0 4px #e4f0e2; }
.hero h1 { max-width: 555px; margin: 23px 0 18px; font-size: clamp(40px, 5vw, 61px); font-weight: 800; letter-spacing: -3.4px; line-height: 1.1; }
.hero h1 span { color: var(--green); }
.hero-description { max-width: 475px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.85; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 23px; margin-top: 30px; }
.text-link { font-size: 12px; }
.hero-note { display: flex; align-items: center; gap: 9px; margin-top: 27px; color: var(--muted); font-size: 11px; font-weight: 600; }
.note-check { display: grid; width: 18px; height: 18px; place-items: center; border-radius: 50%; background: #e4f0e2; color: var(--green); font-size: 11px; font-weight: 900; }
.hero-visual { position: relative; min-width: 0; padding: 14px 0 17px 18px; }
.visual-orbit { position: absolute; border: 1px solid #e2ebe2; border-radius: 50%; }
.orbit-one { top: -31px; right: -81px; width: 180px; height: 180px; }
.orbit-two { bottom: -34px; left: -45px; width: 112px; height: 112px; }
.dashboard-preview { position: relative; z-index: 1; overflow: hidden; border: 1px solid #edf0ea; border-radius: 14px; background: #fff; box-shadow: 0 25px 65px rgb(34 68 48 / 12%); transform: rotate(1deg); }
.preview-topbar { height: 52px; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; border-bottom: 1px solid #f1f3ef; }
.preview-brand { display: flex; align-items: center; gap: 7px; color: var(--ink); font-size: 10px; font-weight: 800; }
.preview-logo { display: grid; width: 21px; height: 21px; place-items: center; border-radius: 7px; background: var(--green); color: white; }
.preview-avatar { display: grid; width: 25px; height: 25px; place-items: center; border-radius: 50%; background: #f3eadc; color: #966e4e; font-size: 8px; font-weight: 800; }
.preview-content { padding: 22px 24px 24px; }
.preview-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.preview-overline { color: #9aa79d; font-size: 7px; font-weight: 800; letter-spacing: .9px; }
.preview-heading h2 { margin: 7px 0 3px; color: var(--ink); font-size: 17px; font-weight: 800; letter-spacing: -.5px; }
.preview-heading p { margin: 0; color: #929e95; font-size: 9px; }
.preview-pill { padding: 6px 8px; border-radius: 12px; background: #f0f7ed; color: #54825a; font-size: 7px; font-weight: 800; white-space: nowrap; }
.preview-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 18px 0 13px; }
.stat-card { display: grid; gap: 5px; padding: 11px 13px; border: 1px solid #eff2ed; border-radius: 8px; }
.stat-card > span { color: #89968d; font-size: 8px; }
.stat-card strong { color: var(--ink); font-size: 22px; line-height: 1; }
.stat-card small { color: #70a278; font-size: 7px; }
.meal-card { padding: 13px 14px 6px; border: 1px solid #eff2ed; border-radius: 9px; }
.meal-card-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 7px; }
.meal-card-heading h3 { margin: 4px 0 0; color: var(--ink); font-size: 11px; font-weight: 800; }
.meal-status { padding: 5px 7px; border-radius: 5px; background: #f3f6eb; color: #72915f; font-size: 7px; font-weight: 700; }
.meal-row { display: grid; grid-template-columns: 25px 1fr auto; align-items: center; gap: 8px; padding: 9px 0; border-top: 1px solid #f3f4f1; }
.meal-icon { display: grid; width: 23px; height: 23px; place-items: center; border-radius: 7px; font-size: 11px; }
.breakfast { background: #fff4d9; color: #d39a2e; }
.lunch { background: #e9f4e7; color: #679b61; }
.snack { background: #f3ebf7; color: #9a72aa; }
.meal-row strong, .meal-row small { display: block; }
.meal-row strong { color: #455d50; font-size: 8px; }
.meal-row small { margin-top: 3px; color: #9aa59d; font-size: 7px; }
.meal-calories { color: #7d8c80; font-size: 7px; }
.floating-note { position: absolute; z-index: 2; right: -18px; bottom: -2px; display: flex; align-items: center; gap: 9px; padding: 11px 14px; border: 1px solid #edf2eb; border-radius: 9px; background: #fff; box-shadow: 0 12px 32px rgb(34 68 48 / 13%); }
.floating-check { display: grid; width: 25px; height: 25px; place-items: center; border-radius: 50%; background: #e9f4e7; color: var(--green); font-size: 12px; font-weight: 900; }
.floating-note strong, .floating-note small { display: block; }
.floating-note strong { color: var(--ink); font-size: 9px; }
.floating-note small { margin-top: 3px; color: #9aa59d; font-size: 7px; }
.decorative-leaf { position: absolute; color: #9dbd8c; }
.leaf-one { top: 0; right: 4px; font-size: 26px; }
.leaf-two { bottom: 42px; left: -28px; color: #e2bd76; font-size: 22px; }

.section { padding: 94px 0; }
.section-heading { max-width: 620px; margin: 0 auto 43px; text-align: center; }
.section-heading h2, .steps-copy h2, .cta-content h2 { margin: 15px 0 12px; color: var(--ink); font-size: clamp(29px, 3.4vw, 40px); font-weight: 800; letter-spacing: -1.7px; line-height: 1.2; }
.section-heading p, .steps-copy > p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.8; }
.feature-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.feature-card { padding: 27px 25px 24px; border: 1px solid #edf1eb; border-radius: 11px; background: #fff; transition: transform .2s ease, box-shadow .2s ease; }
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 16px 35px rgb(34 68 48 / 8%); }
.feature-icon { display: grid; width: 43px; height: 43px; place-items: center; border-radius: 12px; font-size: 19px; font-weight: 800; }
.icon-green { background: #eaf3e8; color: #52815d; }
.icon-yellow { background: #fcf3dc; color: #c2943c; }
.icon-lilac { background: #f3ebf5; color: #9674a4; }
.feature-card h3 { margin: 20px 0 9px; color: var(--ink); font-size: 15px; font-weight: 800; letter-spacing: -.3px; }
.feature-card p { min-height: 62px; margin: 0; color: var(--muted); font-size: 11px; line-height: 1.8; }
.feature-card a { display: inline-flex; gap: 8px; margin-top: 17px; color: var(--green); text-decoration: none; font-size: 10px; font-weight: 800; }
.steps-section { padding-top: 79px; background: var(--cream); }
.steps-grid { display: grid; grid-template-columns: .9fr 1.1fr; align-items: center; gap: 90px; }
.steps-copy h2 { max-width: 410px; }
.steps-copy > p { max-width: 400px; margin-bottom: 24px; }
.steps-list { display: grid; gap: 6px; }
.step-item { display: grid; grid-template-columns: 43px 1fr; gap: 17px; padding: 19px 0; border-bottom: 1px solid #e8eee6; }
.step-item:last-child { border-bottom: 0; }
.step-number { color: #8eb28b; font-size: 13px; font-weight: 800; }
.step-item h3 { margin: 0 0 6px; color: var(--ink); font-size: 13px; font-weight: 800; }
.step-item p { margin: 0; color: var(--muted); font-size: 11px; line-height: 1.7; }
.final-cta { padding: 62px 0; background: var(--green-dark); }
.cta-content { display: flex; align-items: center; justify-content: space-between; gap: 30px; }
.cta-content .eyebrow { color: #c1dda0; }
.cta-content h2 { margin: 12px 0 7px; color: #fff; font-size: clamp(26px, 3vw, 34px); }
.cta-content p { margin: 0; color: #d0ded4; font-size: 12px; }
.button-light { flex: 0 0 auto; border-color: #e2f0d7; background: #e2f0d7; color: var(--green-dark); box-shadow: none; }
.button-light:hover { background: #fff; color: var(--green-dark); }
.site-footer { padding: 25px 0; }
.footer-content { display: flex; align-items: center; justify-content: space-between; gap: 18px; }
.footer-content .brand { font-size: 15px; }
.footer-content .brand-mark { width: 30px; height: 30px; border-radius: 10px; font-size: 15px; }
.footer-content p, .footer-content > span { margin: 0; color: #8c9990; font-size: 10px; }

@media (max-width: 900px) {
    .hero { padding: 60px 0 75px; }
    .hero-grid { grid-template-columns: 1fr 1fr; gap: 15px; }
    .hero h1 { font-size: clamp(38px, 5.3vw, 52px); letter-spacing: -2.5px; }
    .hero-visual { padding-left: 0; }
    .preview-content { padding: 18px 16px; }
    .preview-topbar { padding: 0 15px; }
    .floating-note { right: -7px; }
    .steps-grid { gap: 46px; }
}

@media (max-width: 680px) {
    .container { width: min(100% - 36px, 480px); }
    .header-content { min-height: 70px; }
    .menu-toggle { display: grid; gap: 4px; padding: 8px; border: 0; background: transparent; cursor: pointer; }
    .menu-toggle span { display: block; width: 21px; height: 2px; border-radius: 2px; background: var(--ink); }
    .navigation { position: absolute; top: 69px; right: 0; left: 0; display: none; align-items: stretch; gap: 0; padding: 8px 18px 18px; border-bottom: 1px solid #edf1eb; background: #fff; box-shadow: 0 15px 25px rgb(34 68 48 / 7%); }
    .navigation-open { display: flex; flex-direction: column; }
    .navigation a { padding: 13px 0; }
    .navigation .button-small { margin-top: 7px; padding: 0 15px; }
    .hero { padding: 48px 0 63px; }
    .hero-grid { grid-template-columns: 1fr; gap: 32px; }
    .hero-copy { padding: 0; }
    .hero h1 { max-width: 460px; margin-top: 19px; font-size: clamp(39px, 10vw, 53px); letter-spacing: -2.5px; }
    .hero-description { font-size: 13px; }
    .hero-visual { margin: 0 9px; }
    .dashboard-preview { transform: none; }
    .floating-note { right: -5px; bottom: -15px; }
    .leaf-one { right: -6px; }
    .section { padding: 70px 0; }
    .section-heading { margin-bottom: 30px; }
    .section-heading h2, .steps-copy h2 { font-size: 31px; letter-spacing: -1.2px; }
    .feature-grid { grid-template-columns: 1fr; gap: 12px; }
    .feature-card { padding: 22px; }
    .feature-card p { min-height: 0; }
    .steps-grid { grid-template-columns: 1fr; gap: 28px; }
    .steps-section { padding-top: 66px; }
    .final-cta { padding: 47px 0; }
    .cta-content { align-items: flex-start; flex-direction: column; }
    .cta-content h2 { font-size: 30px; letter-spacing: -1.1px; }
    .footer-content { align-items: flex-start; flex-wrap: wrap; }
    .footer-content p { order: 1; flex-basis: 100%; }
}

@media (prefers-reduced-motion: reduce) {
    .landing-page *, .landing-page *::before, .landing-page *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
