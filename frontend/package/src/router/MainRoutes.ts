const MainRoutes = {
    path: '/main',
    meta: {
        requiresAuth: true
    },
    component: () => import('@/layouts/full/FullLayout.vue'),
    children: [
        {
            name: 'Início',
            path: '',
            component: () => import('@/views/planos/ListaPlanos.vue')
        },
        {
            name: 'Planos alimentares',
            path: '/planos-alimentares',
            component: () => import('@/views/planos/ListaPlanos.vue')
        },
        {
            name: 'Pacientes',
            path: '/pacientes',
            component: () => import('@/views/pacientes/ListaPacientes.vue')
        },
        {
            name: 'Atendimentos',
            path: '/atendimentos',
            component: () => import('@/views/atendimentos/ListaAtendimentos.vue')
        },
        {
            name: 'Novo atendimento',
            path: '/atendimentos/novo',
            component: () => import('@/views/atendimentos/FormularioAtendimento.vue')
        },
        {
            name: 'Abrir atendimento',
            path: '/atendimentos/:id',
            component: () => import('@/views/atendimentos/FormularioAtendimento.vue')
        },
        {
            name: 'Agendamentos',
            path: '/agendamentos',
            component: () => import('@/views/agendamentos/ListaAgendamentos.vue')
        },
        {
            name: 'Alterar senha',
            path: '/alterar-senha',
            component: () => import('@/views/conta/AlterarSenha.vue')
        },
        {
            name: 'Dados do nutricionista',
            path: '/dados-nutricionista',
            component: () => import('@/views/conta/DadosNutricionista.vue')
        },
        {
            name: 'Criar plano alimentar',
            path: '/planos-alimentares/novo',
            component: () => import('@/views/planos/CriarPlano.vue')
        },
        {
            name: 'Abrir plano alimentar',
            path: '/planos-alimentares/:codigo',
            component: () => import('@/views/planos/CriarPlano.vue')
        },
        {
            name: 'Typography',
            path: '/ui/typography',
            component: () => import('@/views/components/Typography.vue')
        },
        {
            name: 'Shadow',
            path: '/ui/shadow',
            component: () => import('@/views/components/Shadow.vue')
        },
        {
            name: 'Alert',
            path: '/ui/alerts',
            component: () => import('@/views/ui-components/Alerts.vue')
        },
        {
            name: 'Buttons',
            path: '/ui/buttons',
            component: () => import('@/views/ui-components/Buttons.vue')
        },
        {
            name: 'Cards',
            path: '/ui/cards',
            component: () => import('@/views/ui-components/Cards.vue')
        },
        {
            name: 'Tables',
            path: '/ui/tables',
            component: () => import('@/views/ui-components/Tables.vue')
        },
        {
            name: 'Icons',
            path: '/icons',
            component: () => import('@/views/pages/Icons.vue')
        },
        {
            name: 'Starter',
            path: '/sample-page',
            component: () => import('@/views/pages/SamplePage.vue')
        },
    ]
};

export default MainRoutes;
