import { BaseService } from './base.service';
import type { Tenant } from '../../types/entities';
import type { DatabaseTenant } from '../../types/database';

export class TenantService extends BaseService<Tenant, DatabaseTenant> {
  constructor() {
    super('tenants');
  }

  protected transformFromDatabase(dbTenant: DatabaseTenant): Tenant {
    return {
      id: dbTenant.id,
      firstName: dbTenant.first_name,
      lastName: dbTenant.last_name,
      email: dbTenant.email,
      phone: dbTenant.phone,
      propertyId: dbTenant.property_id,
      leaseStart: new Date(dbTenant.lease_start),
      leaseEnd: new Date(dbTenant.lease_end),
      rent: dbTenant.rent,
      deposit: dbTenant.deposit,
      status: dbTenant.status,
      createdAt: new Date(dbTenant.created_at),
    };
  }

  protected transformToDatabase(tenant: Partial<Tenant>): Partial<DatabaseTenant> {
    const dbTenant: Partial<DatabaseTenant> = {};

    if (tenant.firstName !== undefined) dbTenant.first_name = tenant.firstName;
    if (tenant.lastName !== undefined) dbTenant.last_name = tenant.lastName;
    if (tenant.email !== undefined) dbTenant.email = tenant.email;
    if (tenant.phone !== undefined) dbTenant.phone = tenant.phone;
    if (tenant.propertyId !== undefined) dbTenant.property_id = tenant.propertyId;
    if (tenant.leaseStart !== undefined) dbTenant.lease_start = tenant.leaseStart.toISOString();
    if (tenant.leaseEnd !== undefined) dbTenant.lease_end = tenant.leaseEnd.toISOString();
    if (tenant.rent !== undefined) dbTenant.rent = tenant.rent;
    if (tenant.deposit !== undefined) dbTenant.deposit = tenant.deposit;
    if (tenant.status !== undefined) dbTenant.status = tenant.status;

    return dbTenant;
  }

  async findByProperty(propertyId: string) {
    return this.findAll({
      filters: { property_id: propertyId },
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async findByStatus(status: Tenant['status']) {
    return this.findAll({
      filters: { status },
      orderBy: 'last_name',
      orderDirection: 'asc',
    });
  }

  async findExpiringLeases(daysAhead: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    // Note: Cette requête nécessiterait une fonction SQL personnalisée
    // Pour l'instant, on récupère tous les locataires actifs et on filtre côté client
    const { data: tenants } = await this.findByStatus('active');
    
    if (!tenants) return { data: [], error: null, success: true };

    const expiringTenants = tenants.filter(tenant => 
      tenant.leaseEnd <= futureDate && tenant.leaseEnd >= new Date()
    );

    return {
      data: expiringTenants,
      error: null,
      success: true,
    };
  }
}

export const tenantService = new TenantService();
