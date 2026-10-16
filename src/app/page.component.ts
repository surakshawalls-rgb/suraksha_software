import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { LucideArrowRight as ArrowRight, LucideCheck as Check, LucideChevronDown as ChevronDown, LucideCode as Code2, LucideLayers as Layers3, LucideMenu as Menu, LucideX as X } from '@lucide/angular';
import { COURSES, FAQS, PORTFOLIO, PROCESS, SERVICES, TECHNOLOGIES, Course, Service } from './content';
import { EnquiryService, EnquiryPayload } from './enquiry.service';
import { ServiceIconComponent } from './service-icon.component';

@Component({
  selector: 'app-page',
  imports: [RouterLink, RouterLinkActive, FormsModule, ArrowRight, Check, ChevronDown, Code2, Layers3, Menu, X, ServiceIconComponent],
  templateUrl: './app.html',
})
export class PageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly enquiry = inject(EnquiryService);
  private routeSubscription?: Subscription;
  readonly menuOpen = signal(false);
  readonly currentPath = signal('/');
  readonly submitted = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal('');
  readonly showCourseField = computed(() => this.form.enquiry_type === 'Training and courses');
  readonly showProjectFields = computed(() => this.form.enquiry_type !== 'Training and courses');
  readonly services = SERVICES;
  readonly courses = COURSES;
  readonly portfolio = PORTFOLIO;
  readonly process = PROCESS;
  readonly technologies = TECHNOLOGIES;
  readonly faqs = FAQS;
  readonly year = new Date().getFullYear();
  readonly form: EnquiryPayload = {
    name: '', email: '', phone: '', company: '', enquiry_type: 'Website development',
    service_interest: '', budget_range: '', expected_timeline: '', message: '', privacy_consent: false,
    website: ''
  };

  readonly pageKind = computed(() => {
    const path = this.currentPath();
    if (path === '/') return 'home';
    if (path === '/services') return 'services';
    if (path === '/training') return 'training';
    if (path === '/portfolio') return 'portfolio';
    if (path === '/about') return 'about';
    if (path === '/process') return 'process';
    if (path === '/technology') return 'technology';
    if (path === '/contact') return 'contact';
    if (path === '/privacy-policy') return 'privacy';
    if (path === '/terms-and-conditions') return 'terms';
    if (path.startsWith('/services/')) return 'service-detail';
    if (path.startsWith('/training/')) return 'course-detail';
    return 'not-found';
  });
  readonly pageTitle = computed(() => {
    const path = this.currentPath();
    const service = SERVICES.find(item => `/services/${item.slug}` === path);
    const course = COURSES.find(item => `/training/${item.slug}` === path);
    return service?.title ?? course?.title ?? ({
      '/': 'Digital solutions, engineered for business',
      '/services': 'Software development services',
      '/training': 'Practical technical training',
      '/portfolio': 'Our work',
      '/about': 'Business-first engineering',
      '/process': 'A thoughtful process, built around you',
      '/technology': 'Technology capabilities',
      '/contact': 'Tell us what you are building',
      '/privacy-policy': 'Privacy policy',
      '/terms-and-conditions': 'Terms and conditions'
    } as Record<string, string>)[path] ?? 'Page not found';
  });
  readonly selectedService = computed(() => SERVICES.find(item => `/services/${item.slug}` === this.currentPath()));
  readonly selectedCourse = computed(() => COURSES.find(item => `/training/${item.slug}` === this.currentPath()));

  ngOnInit(): void {
    this.updateRoute();
    this.routeSubscription = this.router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => { this.updateRoute(); this.menuOpen.set(false); window.scrollTo({ top: 0, behavior: 'instant' }); });
  }
  ngOnDestroy(): void { this.routeSubscription?.unsubscribe(); }
  toggleMenu(): void { this.menuOpen.update(open => !open); }
  private updateRoute(): void {
    this.currentPath.set(this.router.url.split('?')[0].replace(/\/$/, '') || '/');
    const courseSlug = new URLSearchParams(this.router.url.split('?')[1] ?? '').get('course');
    const preselectedCourse = COURSES.find(item => item.slug === courseSlug);
    if (preselectedCourse && this.currentPath() === '/contact') {
      this.form.enquiry_type = 'Training and courses';
      this.form.service_interest = preselectedCourse.title;
    }
    const title = this.pageTitle();
    document.title = `${title} | Suraksha Software`;
    const description = this.metaDescription();
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement('meta'); meta.setAttribute('name', 'description'); document.head.appendChild(meta); }
    meta.setAttribute('content', description);
    this.setMetaProperty('og:title', `${title} | Suraksha Software`);
    this.setMetaProperty('og:description', description);
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.setAttribute('rel', 'canonical'); document.head.appendChild(canonical); }
    canonical.setAttribute('href', `${window.location.origin}${this.currentPath()}`);
    const selectedCourse = this.selectedCourse();
    const service = this.selectedService();
    const structuredData = selectedCourse
      ? { '@context': 'https://schema.org', '@type': 'Course', name: selectedCourse.title, description: selectedCourse.summary, provider: { '@type': 'Organization', name: 'Suraksha Software' } }
      : service
        ? { '@context': 'https://schema.org', '@type': 'Service', name: service.title, description: service.description, provider: { '@type': 'Organization', name: 'Suraksha Software' } }
        : { '@context': 'https://schema.org', '@type': 'Organization', name: 'Suraksha Software', url: `${window.location.origin}/`, description };
    let jsonLd = document.querySelector<HTMLScriptElement>('script[data-site-structured-data]');
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.type = 'application/ld+json';
      jsonLd.dataset['siteStructuredData'] = 'true';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(structuredData).replace(/</g, '\\u003c');
  }
  private setMetaProperty(property: string, content: string): void {
    let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
    if (!tag) { tag = document.createElement('meta'); tag.setAttribute('property', property); document.head.appendChild(tag); }
    tag.content = content;
  }
  private metaDescription(): string {
    return this.selectedService()?.description ?? this.selectedCourse()?.summary ??
      'Suraksha Software designs and develops websites, custom software, mobile apps and practical technical training for businesses and learners.';
  }
  async submitEnquiry(): Promise<void> {
    this.submitted.set(false); this.submitError.set('');
    if (!this.form.privacy_consent) { this.submitError.set('Please agree to the privacy notice before submitting.'); return; }
    this.submitting.set(true);
    try {
      await this.enquiry.submit({ ...this.form, source_page: this.currentPath() });
      this.submitted.set(true);
      Object.assign(this.form, {
        name: '', email: '', phone: '', company: '', service_interest: '',
        budget_range: '', expected_timeline: '', message: '', privacy_consent: false, website: ''
      });
    } catch (error) {
      this.submitError.set(error instanceof Error ? error.message : 'We could not submit your enquiry. Please try again.');
    } finally { this.submitting.set(false); }
  }
  openCourseEnquiry(course: Course): void {
    void this.router.navigate(['/contact'], { queryParams: { course: course.slug } });
  }
  trackBySlug(_: number, item: Service | Course): string { return item.slug; }
}
