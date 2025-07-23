import React, { useState } from 'react';
import { 
  FileDown, 
  Calendar, 
  Download, 
  FileText, 
  HelpCircle, 
  AlertTriangle,
  CheckCircle,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { useFinances } from '../../hooks/useFinances';

const FinancialTaxes: React.FC = () => {
  const { generateTaxReport, settings, updateSettings, loading, error } = useFinances();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  
  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 5; i <= currentYear; i++) {
    years.push(i);
  }

  const handleGenerateReport = async () => {
    try {
      setGeneratingReport(true);
      setReportUrl(null);
      
      const url = await generateTaxReport(selectedYear);
      setReportUrl(url);
    } catch (err) {
      console.error('Erreur lors de la génération du rapport fiscal:', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getTaxRegimeLabel = (regime: string) => {
    switch (regime) {
      case 'micro_foncier':
        return 'Micro-foncier';
      case 'reel':
        return 'Régime réel';
      case 'meuble_non_pro':
        return 'LMNP (Loueur Meublé Non Professionnel)';
      case 'meuble_pro':
        return 'LMP (Loueur Meublé Professionnel)';
      case 'lmnp':
        return 'LMNP (Loueur Meublé Non Professionnel)';
      case 'lmp':
        return 'LMP (Loueur Meublé Professionnel)';
      default:
        return regime;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Fiscalité immobilière</h3>
        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {generatingReport ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FileDown className="h-5 w-5" />
            )}
            <span>Générer déclaration {selectedYear}</span>
          </button>
        </div>
      </div>

      {/* Tax Regime Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Votre régime fiscal</h4>
            <p className="text-gray-600">
              {getTaxRegimeLabel(settings?.taxSettings?.propertyRegime || 'micro_foncier')}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Année fiscale</span>
              <Calendar className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">
              Du {settings?.taxSettings?.fiscalYear?.start?.day || 1} {getMonthName(settings?.taxSettings?.fiscalYear?.start?.month || 1)} au {settings?.taxSettings?.fiscalYear?.end?.day || 31} {getMonthName(settings?.taxSettings?.fiscalYear?.end?.month || 12)}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">TVA</span>
              <DollarSign className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">
              {settings?.taxSettings?.isVatRegistered 
                ? `Assujetti (${settings?.taxSettings?.vatRate || 20}%)`
                : 'Non assujetti à la TVA'
              }
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Numéro fiscal</span>
              <FileText className="h-4 w-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600">
              {settings?.taxSettings?.taxId || 'Non renseigné'}
            </p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-800 font-medium">À propos de votre régime fiscal</p>
              <p className="text-blue-700 text-sm mt-1">
                {settings?.taxSettings?.propertyRegime === 'micro_foncier'
                  ? 'Le régime micro-foncier permet un abattement forfaitaire de 30% sur vos revenus locatifs. Il est accessible si vos revenus fonciers annuels bruts ne dépassent pas 15 000€.'
                  : settings?.taxSettings?.propertyRegime === 'reel'
                  ? 'Le régime réel vous permet de déduire vos charges réelles (travaux, intérêts d\'emprunt, etc.) de vos revenus locatifs. Il est obligatoire si vos revenus fonciers dépassent 15 000€ par an.'
                  : settings?.taxSettings?.propertyRegime === 'lmnp' || settings?.taxSettings?.propertyRegime === 'meuble_non_pro'
                  ? 'Le statut LMNP (Loueur Meublé Non Professionnel) s\'applique à la location de biens meublés. Vous pouvez bénéficier d\'un abattement forfaitaire de 50% (micro-BIC) ou déduire vos charges réelles et amortissements.'
                  : 'Le statut LMP (Loueur Meublé Professionnel) s\'applique lorsque vos recettes annuelles dépassent 23 000€ et représentent plus de 50% de vos revenus professionnels.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Résumé fiscal {selectedYear}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-4">Revenus locatifs</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-900">Loyers perçus</span>
                </div>
                <span className="text-sm font-medium text-gray-900">15 000,00 €</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-900">Charges locatives</span>
                </div>
                <span className="text-sm font-medium text-gray-900">1 800,00 €</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Total revenus bruts</span>
                <span className="text-sm font-bold text-green-600">16 800,00 €</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-4">Charges déductibles</h5>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-900">Frais de gestion</span>
                </div>
                <span className="text-sm font-medium text-gray-900">800,00 €</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-900">Assurances</span>
                </div>
                <span className="text-sm font-medium text-gray-900">600,00 €</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-900">Travaux et entretien</span>
                </div>
                <span className="text-sm font-medium text-gray-900">2 500,00 €</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-900">Taxes foncières</span>
                </div>
                <span className="text-sm font-medium text-gray-900">1 200,00 €</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-gray-900">Intérêts d'emprunt</span>
                </div>
                <span className="text-sm font-medium text-gray-900">3 500,00 €</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-900">Total charges</span>
                <span className="text-sm font-bold text-red-600">8 600,00 €</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Résultat net imposable</h5>
              <p className="text-2xl font-bold text-blue-600">8 200,00 €</p>
              <p className="text-xs text-gray-500 mt-1">
                {settings?.taxSettings?.propertyRegime === 'micro_foncier'
                  ? 'Après abattement forfaitaire de 30%'
                  : 'Après déduction des charges réelles'
                }
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Taux marginal d'imposition</h5>
              <p className="text-2xl font-bold text-purple-600">30%</p>
              <p className="text-xs text-gray-500 mt-1">
                Estimation basée sur votre tranche
              </p>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Impôt estimé</h5>
              <p className="text-2xl font-bold text-red-600">2 460,00 €</p>
              <p className="text-xs text-gray-500 mt-1">
                Hors prélèvements sociaux (17,2%)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Documents fiscaux</h4>
        
        <div className="space-y-4">
          {reportUrl ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-green-800 font-medium">Déclaration {selectedYear} générée</p>
                  <p className="text-green-700 text-sm">
                    Votre déclaration fiscale est prête à être téléchargée
                  </p>
                </div>
              </div>
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger</span>
              </a>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-medium">Déclaration {selectedYear}</p>
                  <p className="text-blue-700 text-sm">
                    Générez votre déclaration fiscale pour l'année {selectedYear}
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateReport}
                disabled={generatingReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {generatingReport ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                <span>Générer</span>
              </button>
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-gray-800 font-medium">Déclaration {selectedYear - 1}</p>
                <p className="text-gray-700 text-sm">
                  Déclaration fiscale de l'année précédente
                </p>
              </div>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Télécharger</span>
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-gray-800 font-medium">Déclaration {selectedYear - 2}</p>
                <p className="text-gray-700 text-sm">
                  Archive des déclarations fiscales
                </p>
              </div>
            </div>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Télécharger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tax Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Calendrier fiscal {selectedYear}</h4>
        
        <div className="space-y-4">
          <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
            <div className="absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
            <div className="mb-1">
              <span className="text-sm font-medium text-blue-600">Janvier {selectedYear}</span>
            </div>
            <p className="text-sm text-gray-600">Paiement du solde de la taxe foncière</p>
          </div>
          
          <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
            <div className="absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
            <div className="mb-1">
              <span className="text-sm font-medium text-blue-600">Avril {selectedYear}</span>
            </div>
            <p className="text-sm text-gray-600">Déclaration des revenus fonciers (formulaire 2044)</p>
          </div>
          
          <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
            <div className="absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
            <div className="mb-1">
              <span className="text-sm font-medium text-blue-600">Mai {selectedYear}</span>
            </div>
            <p className="text-sm text-gray-600">Date limite de déclaration des revenus</p>
          </div>
          
          <div className="relative pl-8 pb-8 border-l-2 border-blue-200">
            <div className="absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
            <div className="mb-1">
              <span className="text-sm font-medium text-blue-600">Septembre {selectedYear}</span>
            </div>
            <p className="text-sm text-gray-600">Paiement de l'acompte de la taxe foncière</p>
          </div>
          
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 transform -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600"></div>
            <div className="mb-1">
              <span className="text-sm font-medium text-blue-600">Décembre {selectedYear}</span>
            </div>
            <p className="text-sm text-gray-600">Dernières opérations fiscales avant clôture de l'année</p>
          </div>
        </div>
      </div>

      {/* Tax Tips */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <HelpCircle className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-900">Conseils fiscaux</h4>
        </div>
        
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-blue-800 font-medium mb-1">Optimisez vos charges déductibles</p>
            <p className="text-blue-700 text-sm">
              N'oubliez pas de déduire toutes vos charges : travaux d'entretien, assurances, frais de gestion, intérêts d'emprunt, etc.
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-1">Anticipez vos travaux</p>
            <p className="text-green-700 text-sm">
              Planifiez vos travaux de rénovation pour optimiser leur déductibilité fiscale selon votre régime d'imposition.
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-purple-800 font-medium mb-1">Conservez vos justificatifs</p>
            <p className="text-purple-700 text-sm">
              Gardez tous vos justificatifs pendant au moins 3 ans (délai de prescription fiscale) en cas de contrôle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour obtenir le nom du mois
const getMonthName = (month: number) => {
  const date = new Date();
  date.setMonth(month - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long' });
};

export default FinancialTaxes;
