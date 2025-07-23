export const calculateYield = (rent: number) => {
  const annualRent = rent * 12;
  // Estimation du prix d'achat basée sur le rendement moyen de 4%
  const estimatedPrice = annualRent / 0.04;
  const calculatedYield = (annualRent / estimatedPrice) * 100;
  return calculatedYield.toFixed(1);
};
