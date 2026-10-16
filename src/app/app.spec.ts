import { COURSES, SERVICES } from './content';
import { routes } from './app.routes';
import { EnquiryService } from './enquiry.service';

describe('Suraksha Software site content', () => {
  it('defines eight services and eight dedicated course routes', () => {
    expect(SERVICES).toHaveLength(8);
    expect(COURSES).toHaveLength(8);
    for (const course of COURSES) {
      expect(routes.some(route => route.path === `training/${course.slug}`)).toBe(true);
    }
  });

  it('registers all required pages and a not-found route', () => {
    for (const path of ['', 'services', 'portfolio', 'about', 'process', 'technology',
      'training', 'contact', 'privacy-policy', 'terms-and-conditions']) {
      expect(routes.some(route => route.path === path)).toBe(true);
    }
    expect(routes[routes.length - 1].path).toBe('**');
  });

  it('does not report an enquiry as successful when Supabase is unconfigured', async () => {
    const service = new EnquiryService();
    await expect(service.submit({
      name: 'Test Visitor', email: 'visitor@example.com', phone: '', company: '',
      enquiry_type: 'Website development', service_interest: '', budget_range: '',
      expected_timeline: '', message: 'A sample enquiry message', privacy_consent: true
    })).rejects.toThrow('not configured');
  });
});
