export class ScenarioService {
  /**
   * Deterministic EMI Calculator for Debt Intelligence
   */
  static calculateDebtScenario(principal: number, annualInterestRate: number, tenureMonths: number) {
    if (annualInterestRate === 0) {
      return {
        monthlyEMI: principal / tenureMonths,
        totalInterest: 0,
        totalPayment: principal
      };
    }

    const monthlyRate = annualInterestRate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;

    return {
      monthlyEMI: Math.round(emi * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      assumptions: [
        'Interest is compounded monthly.',
        'EMI is constant for the tenure.',
        'No moratorium period is applied.'
      ]
    };
  }

  /**
   * Equity Dilution Calculator for Equity Intelligence
   */
  static calculateEquityScenario(
    currentValuation: number,
    investmentAmount: number,
    currentFounderOwnershipPct: number
  ) {
    const postMoneyValuation = currentValuation + investmentAmount;
    const newInvestorOwnershipPct = (investmentAmount / postMoneyValuation) * 100;
    
    // Dilute existing ownership proportionally
    const dilutionFactor = 1 - (newInvestorOwnershipPct / 100);
    const newFounderOwnershipPct = currentFounderOwnershipPct * dilutionFactor;

    return {
      preMoneyValuation: currentValuation,
      postMoneyValuation,
      investmentAmount,
      newInvestorOwnershipPct: Math.round(newInvestorOwnershipPct * 100) / 100,
      newFounderOwnershipPct: Math.round(newFounderOwnershipPct * 100) / 100,
      assumptions: [
        'Simple SAFE or straight equity conversion.',
        'No existing option pool expansion is factored in.'
      ]
    };
  }
}
