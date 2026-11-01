import { createVuetify } from 'vuetify';
import '@mdi/font/css/materialdesignicons.css';
import { BLUE_THEME} from '@/theme/LightTheme';


export default createVuetify({
    theme: {
        defaultTheme: 'BLUE_THEME',
        themes: {
            BLUE_THEME,
        }
    },
    defaults: {
        VBtn: {},
        VCard: {
            rounded: 'md'
        },
        VTextField: {
            rounded: 'lg'
        },
        VTooltip: {
            location: 'top'
        }
    }
});
