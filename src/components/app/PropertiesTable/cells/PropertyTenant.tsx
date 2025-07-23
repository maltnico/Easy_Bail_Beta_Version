import React from 'react';
import { Calendar, Mail, Phone } from 'lucide-react';
import { Tenant } from '../../../../types';

interface PropertyTenantProps {
  tenant?: Tenant;
}

export const PropertyTenant: React.FC<PropertyTenantProps> = ({ tenant }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!tenant) {
    return (
      <td className="py-4 px-6">
        <span className="text-sm text-gray-500 italic">Vacant</span>
      </td>
    );
  }

  return (
    <td className="py-4 px-6">
      <div className="text-sm">
        <div className="font-medium text-gray-900">
          {tenant.firstName} {tenant.lastName}
        </div>
        <div className="text-gray-500 text-xs">
          Jusqu'au {tenant.leaseEnd.toLocaleDateString('fr-FR')}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <button
            onClick={() => copyToClipboard(tenant.email)}
            className="text-blue-600 hover:text-blue-700"
            title="Copier l'email"
          >
            <Mail className="h-3 w-3" />
          </button>
          <button
            onClick={() => copyToClipboard(tenant.phone)}
            className="text-green-600 hover:text-green-700"
            title="Copier le téléphone"
          >
            <Phone className="h-3 w-3" />
          </button>
        </div>
      </div>
    </td>
  );
};
