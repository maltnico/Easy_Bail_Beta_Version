import { BaseService } from './base.service';
import type { Property } from '../../types/entities';
import type { DatabaseProperty } from '../../types/database';

export class PropertyService extends BaseService<Property, DatabaseProperty> {
  constructor() {
    super('properties');
  }

  protected transformFromDatabase(dbProperty: DatabaseProperty): Property {
    return {
      id: dbProperty.id,
      name: dbProperty.name,
      address: dbProperty.address,
      type: dbProperty.type,
      status: dbProperty.status,
      rent: dbProperty.rent,
      charges: dbProperty.charges,
      surface: dbProperty.surface,
      rooms: dbProperty.rooms,
      createdAt: new Date(dbProperty.created_at),
      updatedAt: new Date(dbProperty.updated_at),
    };
  }

  protected transformToDatabase(property: Partial<Property>): Partial<DatabaseProperty> {
    const dbProperty: Partial<DatabaseProperty> = {};

    if (property.name !== undefined) dbProperty.name = property.name;
    if (property.address !== undefined) dbProperty.address = property.address;
    if (property.type !== undefined) dbProperty.type = property.type;
    if (property.status !== undefined) dbProperty.status = property.status;
    if (property.rent !== undefined) dbProperty.rent = property.rent;
    if (property.charges !== undefined) dbProperty.charges = property.charges;
    if (property.surface !== undefined) dbProperty.surface = property.surface;
    if (property.rooms !== undefined) dbProperty.rooms = property.rooms;

    return dbProperty;
  }

  async findByStatus(status: Property['status']) {
    return this.findAll({
      filters: { status },
      orderBy: 'created_at',
      orderDirection: 'desc',
    });
  }

  async findByType(type: Property['type']) {
    return this.findAll({
      filters: { type },
      orderBy: 'name',
      orderDirection: 'asc',
    });
  }

  async getOccupancyStats() {
    const { data: properties } = await this.findAll();
    
    if (!properties) {
      return {
        total: 0,
        occupied: 0,
        vacant: 0,
        maintenance: 0,
        occupancyRate: 0,
      };
    }

    const stats = properties.reduce(
      (acc, property) => {
        acc.total++;
        acc[property.status]++;
        return acc;
      },
      { total: 0, occupied: 0, vacant: 0, maintenance: 0 }
    );

    return {
      ...stats,
      occupancyRate: stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0,
    };
  }
}

export const propertyService = new PropertyService();
