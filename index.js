
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Tool implementations
function calculateCompoundInterest(
  principal,
  annualRate,
  compoundingFrequency,
  years
) {
  const rate = annualRate / 100;
  const amount =
    principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
  const interest = amount - principal;
  return {
    finalAmount: parseFloat(amount.toFixed(2)),
    totalInterest: parseFloat(interest.toFixed(2)),
    principalAmount: principal,
  };
}

function calculateInvestmentScenarios(
  principal,
  annualRate,
  compoundingFrequency,
  yearsArray
) {
  const scenarios = [];
  for (const years of yearsArray) {
    const result = calculateCompoundInterest(
      principal,
      annualRate,
      compoundingFrequency,
      years
    );
    scenarios.push({
      years,
      finalAmount: result.finalAmount,
      totalInterest: result.totalInterest,
    });
  }
  return scenarios;
}

function compareInvestmentOptions(options) {
  const results = [];
  for (const option of options) {
    const result = calculateCompoundInterest(
      option.principal,
      option.annualRate,
      option.compoundingFrequency,
      option.years
    );
    results.push({
      optionName: option.name,
      finalAmount: result.finalAmount,
      totalInterest: result.totalInterest,
      annualRate: option.annualRate,
    });
  }
  return results.sort((a, b) => b.finalAmount - a.finalAmount);
}

function calculateBreakevenYears(principal, targetAmount, annualRate, compoundingFrequency) {
  const rate = annualRate / 100;
  const yearsNeeded =
    Math.log(targetAmount / principal) /
    (compoundingFrequency * Math.log(1 + rate / compoundingFrequency));
  return {
    yearsNeeded: parseFloat(yearsNeeded.toFixed(2)),
    targetAmount,
    principal,
  };
}

const tools = [
  {
    name: "calculate_compound_interest",
    description:
      "Calculates the compound interest for an investment given principal amount, annual interest rate, compounding frequency, and number of years",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "The initial investment amount in currency units",
        },
        annual_rate: {
          type: "number",
          description: "The annual interest rate as a percentage (e.g., 5 for 5%)",
        },
        compounding_frequency: {
          type: "number",
          description:
            "Number of times interest is compounded per year (1=annually, 2=semi-annually, 4=quarterly, 12=monthly)",
        },
        years: {
          type: "number",
          description: "Number of years for the investment",
        },
      },
      required: ["principal", "annual_rate", "compounding_frequency", "years"],
    },
  },
  {
    name: "calculate_scenarios",
    description:
      "Calculates compound interest for multiple time periods to show investment growth over different years",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "The initial investment amount",
        },
        annual_rate: {
          type: "number",
          description: "The annual interest rate as a percentage",
        },
        compounding_frequency: {
          type: "number",
          description: "Number of times interest is compounded per year",
        },
        years_array: {
          type: "array",
          items: { type: "number" },
          description: "Array of years to calculate scenarios for",
        },
      },
      required: ["principal", "annual_rate", "compounding_frequency", "years_array"],
    },
  },
  {
    name: "compare_investments",
    description:
      "Compares multiple investment options and ranks them by final amount",
    input_schema: {
      type: "object",
      properties: {
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              principal: { type: "number" },
              annual_rate: { type: "number" },
              compounding_frequency: { type: "number" },
              years: { type: "number" },
            },
            required: ["name", "principal", "annual_rate", "compounding_frequency", "years"],
          },
          description: "Array of investment options to compare",
        },
      },
      required: ["options"],
    },
  },
  {
    name: "calculate_breakeven_years",
    description:
      "Calculates how many years it takes to reach a target investment amount",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "The initial investment amount",
        },
        target_amount: {
          type: "number",
          description: "The target amount to reach",
        },
        annual_rate: {
          type: "number",
          description: "The annual interest rate as a percentage",
        },
        compounding_frequency: {
          type: "number",
          description: "Number of times interest is compounded per year",