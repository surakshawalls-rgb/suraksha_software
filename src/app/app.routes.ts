import { Routes } from '@angular/router';
const allRoutes = [
  'services', 'case-studies', 'about', 'process', 'technology', 'training', 'contact',
  'privacy-policy', 'terms-and-conditions',
  'services/web-development', 'services/software-development', 'services/mobile-app-development',
  'services/ecommerce', 'services/branding-digital-marketing', 'services/seo-smo',
  'services/bulk-sms', 'services/domain-hosting',
  'case-studies/soft-steps-carpets', 'case-studies/madad-qr', 'case-studies/suraksha-walls',
  'case-studies/all-india-fire-solutions', 'case-studies/square-associates', 'case-studies/shrinathji-developers',
  'training/frontend-ui-engineering', 'training/java-full-stack-development',
  'training/spring-ecosystem-data', 'training/python-ai-productivity',
  'training/dev-workflow-delivery', 'training/c-cpp-programming',
  'training/go-cloud-backend', 'training/react-frontend-frameworks'
];

export const routes: Routes = [
  { path: 'portfolio', redirectTo: 'case-studies', pathMatch: 'full' },
  ...allRoutes.map(path => ({
    path,
    loadComponent: () => import('./page.component').then(module => module.PageComponent)
  })),
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./page.component').then(module => module.PageComponent)
  },
  { path: '**', loadComponent: () => import('./page.component').then(module => module.PageComponent) }
];