import { useState, useCallback } from 'react';

export const useTableActions = () => {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    // Optionally show a toast notification here
  }, []);

  const handleOpenInMaps = useCallback((address: string) => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  }, []);

  const handleGenerateReport = useCallback((propertyId: string) => {
    // Placeholder for report generation
    console.log('Generating report for property:', propertyId);
  }, []);

  return {
    actionMenuOpen,
    setActionMenuOpen,
    handleCopyToClipboard,
    handleOpenInMaps,
    handleGenerateReport
  };
};
