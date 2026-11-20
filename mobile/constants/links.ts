import * as WebBrowser from 'expo-web-browser';
import { Colors } from '@/constants/Colors';

// Paginas publicas do CicloLeve (site/ no repositorio, publicado na VPS).
export const SITE = 'https://appcicloleve.atimoscrm.com.br';

export const LINKS = {
  termos: `${SITE}/termos`,
  privacidade: `${SITE}/privacidade`,
  suporte: `${SITE}/suporte`,
};

/** Abre a pagina dentro do app (navegador do sistema por cima), sem sair do CicloLeve. */
export function abrirLink(url: string) {
  return WebBrowser.openBrowserAsync(url, {
    controlsColor: Colors.primary.DEFAULT,
    toolbarColor: '#FFFFFF',
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
  }).catch(() => null);
}
