import { describe, expect, it } from 'vitest';
import { enquirySchema, projectSchema, paginationSchema } from '@showcase/shared-validation';
import { publicProjectWhere } from './catalog.js';

describe('shared request validation', () => {
  it('requires a valid Indian mobile number and explicit contact consent', () => {
    const base={name:'Asha Rao',email:'asha@example.in',phone:'+919876543210',message:'I need a business website',contactConsent:true};
    expect(enquirySchema.safeParse(base).success).toBe(true);
    expect(enquirySchema.safeParse({...base,phone:'9876543210'}).success).toBe(false);
    expect(enquirySchema.safeParse({...base,contactConsent:false}).success).toBe(false);
  });
  it('rejects non-HTTP project URLs and invalid slugs', () => {
    const base={name:'Clinic Website',slug:'clinic-website',industryId:'00000000-0000-4000-8000-000000000001',shortDescription:'A clear website for a modern clinic',liveUrl:'https://example.in'};
    expect(projectSchema.safeParse(base).success).toBe(true);
    expect(projectSchema.safeParse({...base,slug:'Bad Slug'}).success).toBe(false);
    expect(projectSchema.safeParse({...base,liveUrl:'javascript:alert(1)'}).success).toBe(false);
  });
  it('caps page size and applies sensible pagination defaults', () => {
    expect(paginationSchema.parse({}).limit).toBe(20);
    expect(paginationSchema.safeParse({limit:'1000'}).success).toBe(false);
  });
  it('never broadens public project queries to drafts, archived or removed records',()=>{
    const where=publicProjectWhere({q:'clinic',industry:'healthcare',category:'clinics',featured:'true'});
    expect(where.status).toBe('PUBLISHED');
    expect(where.deletedAt).toBeNull();
    expect(where.industry).toMatchObject({active:true,deletedAt:null,slug:'healthcare'});
    expect(where.category).toMatchObject({active:true,deletedAt:null,slug:'clinics'});
  });
});
