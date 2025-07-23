import { Property, Tenant, Document, FinancialFlow, Automation, Alert } from '../types';

export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Appartement Bastille',
    address: '15 rue de la Roquette, 75011 Paris',
    type: 'apartment',
    status: 'occupied',
    rent: 1200,
    charges: 150,
    surface: 45,
    rooms: 2,
    tenant: {
      id: '1',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@email.com',
      phone: '06 12 34 56 78',
      propertyId: '1',
      leaseStart: new Date('2023-09-01'),
      leaseEnd: new Date('2024-08-31'),
      rent: 1200,
      deposit: 2400,
      status: 'active',
      createdAt: new Date('2023-08-15')
    },
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-08-15')
  },
  {
    id: '2',
    name: 'Studio Montmartre',
    address: '8 rue des Abbesses, 75018 Paris',
    type: 'studio',
    status: 'vacant',
    rent: 850,
    charges: 80,
    surface: 25,
    rooms: 1,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date('2023-11-20')
  },
  {
    id: '3',
    name: 'Maison Vincennes',
    address: '42 avenue de Paris, 94300 Vincennes',
    type: 'house',
    status: 'occupied',
    rent: 2200,
    charges: 200,
    surface: 120,
    rooms: 5,
    tenant: {
      id: '2',
      firstName: 'Pierre',
      lastName: 'Dubois',
      email: 'pierre.dubois@email.com',
      phone: '06 98 76 54 32',
      propertyId: '3',
      leaseStart: new Date('2023-06-01'),
      leaseEnd: new Date('2026-05-31'),
      rent: 2200,
      deposit: 4400,
      status: 'active',
      createdAt: new Date('2023-05-15')
    },
    createdAt: new Date('2022-12-01'),
    updatedAt: new Date('2023-05-15')
  }
];

export const mockDocuments: Document[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Contrat de bail - Appartement Bastille',
    type: 'lease',
    status: 'received',
    propertyId: '1',
    tenantId: '1',
    createdAt: new Date('2023-08-15'),
    signedAt: new Date('2023-08-20')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: 'État des lieux d\'entrée - Appartement Bastille',
    type: 'inventory',
    status: 'received',
    propertyId: '1',
    tenantId: '1',
    createdAt: new Date('2023-08-20'),
    signedAt: new Date('2023-08-20')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'Quittance Novembre 2024',
    type: 'receipt',
    status: 'received',
    propertyId: '1',
    tenantId: '1',
    createdAt: new Date('2024-11-01'),
    signedAt: new Date('2024-11-05')
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    name: 'Attestation assurance habitation',
    type: 'insurance',
    status: 'draft',
    propertyId: '1',
    tenantId: '1',
    createdAt: new Date('2024-12-01')
  }
];

export const mockFinancialFlows: FinancialFlow[] = [
  {
    id: '1',
    type: 'income',
    category: 'Loyer',
    amount: 1200,
    description: 'Loyer Novembre 2024 - Appartement Bastille',
    date: new Date('2024-11-05'),
    propertyId: '1',
    recurring: true,
    status: 'completed'
  },
  {
    id: '2',
    type: 'income',
    category: 'Charges',
    amount: 150,
    description: 'Charges Novembre 2024 - Appartement Bastille',
    date: new Date('2024-11-05'),
    propertyId: '1',
    recurring: true,
    status: 'completed'
  },
  {
    id: '3',
    type: 'expense',
    category: 'Travaux',
    amount: 450,
    description: 'Réparation plomberie - Studio Montmartre',
    date: new Date('2024-11-15'),
    propertyId: '2',
    recurring: false,
    status: 'completed'
  },
  {
    id: '4',
    type: 'expense',
    category: 'Assurance',
    amount: 180,
    description: 'Assurance PNO annuelle',
    date: new Date('2024-12-01'),
    recurring: true,
    status: 'pending'
  }
];

export const mockAutomations: Automation[] = [
  {
    id: '1',
    name: 'Génération quittances mensuelles',
    type: 'receipt',
    frequency: 'monthly',
    nextExecution: new Date('2024-12-05'),
    active: true,
    propertyId: '1'
  },
  {
    id: '2',
    name: 'Révision loyer annuelle',
    type: 'rent_review',
    frequency: 'yearly',
    nextExecution: new Date('2024-09-01'),
    active: true,
    propertyId: '1'
  },
  {
    id: '3',
    name: 'Rappel assurance habitation',
    type: 'insurance',
    frequency: 'yearly',
    nextExecution: new Date('2024-12-15'),
    active: true,
    propertyId: '1'
  }
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Assurance habitation à renouveler',
    message: 'L\'assurance habitation de Marie Martin expire le 15 décembre 2024',
    type: 'warning',
    priority: 'high',
    read: false,
    createdAt: new Date('2024-12-01'),
    actionUrl: '/documents'
  },
  {
    id: '2',
    title: 'Nouveau locataire potentiel',
    message: 'Une demande de visite a été reçue pour le Studio Montmartre',
    type: 'info',
    priority: 'medium',
    read: false,
    createdAt: new Date('2024-11-28')
  },
  {
    id: '3',
    title: 'Quittance générée automatiquement',
    message: 'La quittance de novembre 2024 a été générée et envoyée à Marie Martin',
    type: 'success',
    priority: 'low',
    read: true,
    createdAt: new Date('2024-11-05')
  }
];
