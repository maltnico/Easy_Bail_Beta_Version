export interface DocumentTemplate {
  id: string;
  name: string;
  type: DocumentType;
  category: DocumentCategory;
  description: string;
  fields: DocumentField[];
  content: string; // Template HTML/text content
  isRequired: boolean;
  legalCompliance: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'signature';
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  defaultValue?: any;
  dependsOn?: string; // Field dependency
}

export type DocumentType = 
  | 'lease' 
  | 'inventory' 
  | 'receipt' 
  | 'notice' 
  | 'insurance' 
  | 'guarantee'
  | 'amendment'
  | 'termination'
  | 'renewal'
  | 'other';

export type DocumentCategory = 
  | 'rental_start'
  | 'rental_management'
  | 'rental_end'
  | 'financial'
  | 'legal'
  | 'maintenance'
  | 'administrative';

export type DocumentStatus = 
  | 'draft'
  | 'sent'
  | 'received'
  | 'archived'
  | 'cancelled';

export interface GeneratedDocument {
  id: string;
  templateId: string;
  userId: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  propertyId?: string;
  tenantId?: string;
  data: Record<string, any>; // Form data
  content: string; // Generated content
  signatures: DocumentSignature[];
  createdAt: Date;
  updatedAt: Date;
  signedAt?: Date;
  expiresAt?: Date;
  metadata: {
    version: string;
    generatedBy: string;
    legalFramework: string;
    pdfData?: string;
  };
}

export interface DocumentSignature {
  id: string;
  signerName: string;
  signerEmail: string;
  signerRole: 'landlord' | 'tenant' | 'guarantor' | 'witness';
  signedAt?: Date;
  signatureData?: string; // Base64 signature image
  ipAddress?: string;
  userAgent?: string;
}

export interface DocumentGenerationOptions {
  templateId: string;
  data: Record<string, any>;
  propertyId?: string;
  tenantId?: string;
  autoSend?: boolean;
  signers?: Array<{
    name: string;
    email: string;
    role: 'landlord' | 'tenant' | 'guarantor' | 'witness';
  }>;
}
