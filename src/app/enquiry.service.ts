import { Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface EnquiryPayload {
  name: string; email: string; phone: string; company: string; enquiry_type: string;
  service_interest: string; budget_range: string; expected_timeline: string;
  message: string; privacy_consent: boolean; source_page?: string; website?: string;
}

@Injectable({ providedIn: 'root' })
export class EnquiryService {
  private readonly endpoint = (globalThis as typeof globalThis & { __SUPABASE_URL__?: string }).__SUPABASE_URL__;
  private readonly anonKey = (globalThis as typeof globalThis & { __SUPABASE_ANON_KEY__?: string }).__SUPABASE_ANON_KEY__;
  private clientPromise?: Promise<SupabaseClient>;

  private getClient(endpoint: string, anonKey: string): Promise<SupabaseClient> {
    this.clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
      createClient(endpoint, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      })
    );
    return this.clientPromise;
  }

  async submit(form: EnquiryPayload): Promise<void> {
    const endpoint = this.endpoint;
    const anonKey = this.anonKey;
    if (!endpoint || !anonKey) {
      throw new Error('Enquiry submission is not configured yet. Please contact the site owner to set up Supabase.');
    }
    const clean = (value: string, max: number) => value.trim().slice(0, max);
    const payload = {
      name: clean(form.name, 120), email: clean(form.email, 254).toLowerCase(),
      phone: clean(form.phone, 32) || null, company: clean(form.company, 160) || null,
      enquiry_type: clean(form.enquiry_type, 80),
      service_interest: clean(form.service_interest, 120) || null,
      budget_range: clean(form.budget_range, 80) || null,
      expected_timeline: clean(form.expected_timeline, 80) || null,
      message: clean(form.message, 4000), privacy_consent: form.privacy_consent,
      source_page: clean(form.source_page ?? '', 255) || null,
      website: clean(form.website ?? '', 160)
    };
    if (payload.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
      payload.message.length < 10 || !payload.privacy_consent) {
      throw new Error('Please check your name, email, message and privacy acknowledgement.');
    }
    const client = await this.getClient(endpoint, anonKey);
    const { error } = await client.functions.invoke('submit-enquiry', { body: payload });
    if (error) throw new Error('We could not submit your enquiry right now. Please try again later.');
  }
}
