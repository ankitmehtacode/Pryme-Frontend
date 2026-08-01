// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import { BankComparisonCard, type BankOfferDTO } from "./BankComparisonCard";

const meta: Meta<typeof BankComparisonCard> = {
  title: "Loan/BankComparisonCard",
  component: BankComparisonCard,
};
export default meta;

type Story = StoryObj<typeof BankComparisonCard>;

const offer: BankOfferDTO = {
  id: "abfl-hl-1",
  bankName: "Aditya Birla Finance Limited",
  logoColor: "#ea1c24",
  brandHex: "#ea1c24",
  interestRate: 8,
  processingFee: 11800,
  effectiveTenureYears: 20,
  maxLoanAmount: 5000000,
  approvalOdds: 90,
  processingTime: "48 hours",
  requiredDocs: [],
  originalEngineResult: { rejectionReasons: [], eligible: true, productCode: "ABFL-HL" },
  employmentType: "SALARIED",
  requestedTenure: 20,
};

const rewards = [
  {
    bank: "Aditya Birla Finance Limited",
    productCode: "HL",
    employmentType: "SALARIED",
    iconType: "GIFT",
    reward1: "Top Load Semi Automatic Washing Machine",
    reward2: "32\" Smart LED TV",
    buttonDesign: "ocean-blue",
  },
];

export const Default: Story = {
  render: () => (
    <MemoryRouter>
      <div style={{ maxWidth: 1200, padding: 24, background: "#f8fafc" }}>
        <BankComparisonCard
          offer={offer}
          emi={41822}
          totalRepayment={10037280}
          emiDiffFromHero={0}
          totalDiffFromHero={0}
          heroBankName="Aditya Birla Finance Limited"
          principalAmount={5000000}
          isExpanded={false}
          onToggleExpand={() => {}}
          onApply={async () => {}}
          isGlobalLocking={false}
          isRecommended
          isLowestEmi
          isFullyFunded
          rewards={rewards}
        />
      </div>
    </MemoryRouter>
  ),
};

export const BelowRequest: Story = {
  render: () => (
    <MemoryRouter>
      <div style={{ maxWidth: 1200, padding: 24, background: "#f8fafc" }}>
        <BankComparisonCard
          offer={offer}
          emi={48000}
          totalRepayment={11520000}
          emiDiffFromHero={0}
          totalDiffFromHero={0}
          heroBankName="Aditya Birla Finance Limited"
          principalAmount={5738858}
          isExpanded={false}
          onToggleExpand={() => {}}
          onApply={async () => {}}
          isGlobalLocking={false}
          isRecommended
          isLowestEmi={false}
          isFullyFunded={false}
          rewards={rewards}
        />
      </div>
    </MemoryRouter>
  ),
};

export const Expanded: Story = {
  render: () => (
    <MemoryRouter>
      <div style={{ maxWidth: 1200, padding: 24, background: "#f8fafc" }}>
        <BankComparisonCard
          offer={offer}
          emi={41822}
          totalRepayment={10037280}
          emiDiffFromHero={0}
          totalDiffFromHero={0}
          heroBankName="Aditya Birla Finance Limited"
          principalAmount={5000000}
          isExpanded
          onToggleExpand={() => {}}
          onApply={async () => {}}
          isGlobalLocking={false}
          isRecommended
          isLowestEmi
          isFullyFunded
          rewards={rewards}
        />
      </div>
    </MemoryRouter>
  ),
};
