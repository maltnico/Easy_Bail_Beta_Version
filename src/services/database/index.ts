// Point d'entrée centralisé pour tous les services de base de données
export { BaseService } from './base.service';
export { PropertyService, propertyService } from './property.service';
export { TenantService, tenantService } from './tenant.service';

// Types de réponse communs
export type { ServiceResponse, ListResponse } from './base.service';
