"use client";

import { FormEvent, useMemo, useState } from "react";

type SurveyState = {
  businessName: string;
  sector: string;
  sectorOther: string;
  yearsOperating: string;
  employees: string;
  annualRevenue: string;
  fundingHistory: string[];
  primaryCapitalSource: string;
  bankLoanExperience: string;
  barriers: string[];
  barriersOther: string;
  targetRaiseAmount: string;
  capitalMarketFamiliarity: string;
  investedProducts: string[];
  listingConsideration: string;
  investorConcerns: string[];
  investorConcernsOther: string;
  growthChallenge: string;
  digitalPlatformComfort: string;
  pilotInterest: string;
  phone: string;
  email: string;
  preferredContact: string[];
};

const cardClass = "rounded-xl border border-border bg-dark-200 p-6";
const inputClass = "mt-1 w-full rounded-md border border-border bg-dark-100 px-3 py-2 text-white";
const optionClass = "rounded-md border border-border px-3 py-2 text-sm text-light-100";

const initialState: SurveyState = {
  businessName: "",
  sector: "",
  sectorOther: "",
  yearsOperating: "",
  employees: "",
  annualRevenue: "",
  fundingHistory: [],
  primaryCapitalSource: "",
  bankLoanExperience: "",
  barriers: [],
  barriersOther: "",
  targetRaiseAmount: "",
  capitalMarketFamiliarity: "",
  investedProducts: [],
  listingConsideration: "",
  investorConcerns: [],
  investorConcernsOther: "",
  growthChallenge: "",
  digitalPlatformComfort: "",
  pilotInterest: "",
  phone: "",
  email: "",
  preferredContact: [],
};

export default function SMEVoicePage() {
  const [formData, setFormData] = useState<SurveyState>(initialState);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      formData.businessName.trim() &&
      formData.sector &&
      formData.yearsOperating &&
      formData.employees &&
      formData.annualRevenue &&
      formData.primaryCapitalSource.trim() &&
      formData.bankLoanExperience &&
      formData.targetRaiseAmount &&
      formData.capitalMarketFamiliarity &&
      formData.listingConsideration &&
      formData.growthChallenge.trim() &&
      formData.digitalPlatformComfort.trim() &&
      formData.pilotInterest
    );
  }, [formData]);

  const toggleMulti = (
    key: "fundingHistory" | "barriers" | "investedProducts" | "investorConcerns" | "preferredContact",
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: checked ? [...prev[key], value] : prev[key].filter((item) => item !== value),
    }));
  };

  const submitSurvey = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem("nbx-company-survey", JSON.stringify(formData));
    setSubmitted(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-12">
      <section className={cardClass}>
        <h1 className="text-3xl font-semibold text-white">NBX Company Survey</h1>
        <p className="mt-3 text-sm text-light-100">
          NBX is a participant of the NSE innovation lab aimed at finding out how technology can be
          used to enhance capital access to SMEs like yourself. The innovation lab was announced
          early 2025. At the bottom is the NSE announcement on YouTube.
        </p>
        <p className="mt-2 text-sm text-light-200">
          NBX is building Africa&apos;s first blockchain-powered SME stock exchange. Your voice
          shapes how we design the platform. This survey takes approximately 5 minutes.
        </p>
      </section>

      <form onSubmit={submitSurvey} className={`${cardClass} space-y-8`}>
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">SECTION 1: About your Company</h2>
          <label className="block text-sm text-light-100">
            1. What is your business name? *
            <input
              className={inputClass}
              value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              required
            />
          </label>

          <label className="block text-sm text-light-100">
            2. What sector does your business operate in?
            <select
              className={inputClass}
              value={formData.sector}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option>Retail & Trade</option>
              <option>Agriculture & Agro-processing</option>
              <option>Food & Hospitality</option>
              <option>Creative & Media</option>
              <option>Construction & Real Estate</option>
              <option>Manufacturing</option>
              <option>Health & Wellness</option>
              <option>Other</option>
            </select>
          </label>

          {formData.sector === "Other" && (
            <label className="block text-sm text-light-100">
              Other sector
              <input
                className={inputClass}
                value={formData.sectorOther}
                onChange={(e) => setFormData({ ...formData, sectorOther: e.target.value })}
              />
            </label>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <label className="text-sm text-light-100">
              3. How long has your business been operating?
              <select
                className={inputClass}
                value={formData.yearsOperating}
                onChange={(e) => setFormData({ ...formData, yearsOperating: e.target.value })}
                required
              >
                <option value="">Select</option>
                <option>Less than a year</option>
                <option>1 - 3 Years</option>
                <option>3 - 5 Years</option>
                <option>5 - 10 Years</option>
                <option>Over 10 Years</option>
              </select>
            </label>

            <label className="text-sm text-light-100">
              4. How many employees do you currently have?
              <select
                className={inputClass}
                value={formData.employees}
                onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                required
              >
                <option value="">Select</option>
                <option>Solo</option>
                <option>2 - 5 Employees</option>
                <option>6 - 20 Employees</option>
                <option>21 - 50 Employees</option>
                <option>51 - 100 Employees</option>
                <option>Over 100 Employees</option>
              </select>
            </label>

            <label className="text-sm text-light-100">
              5. What is your approximate annual revenue?
              <select
                className={inputClass}
                value={formData.annualRevenue}
                onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                required
              >
                <option value="">Select</option>
                <option>Under KES 500,000</option>
                <option>KES 500,000 - 2 million</option>
                <option>KES 2 million - 10 million</option>
                <option>KES 10 million - 50 million</option>
                <option>KES 50 million - 200 million</option>
                <option>Over KES 200 million</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">
            SECTION 2: Capital Sources and Funding History
          </h2>

          <div>
            <p className="text-sm text-light-100">
              1. How have you funded your business so far? (Select all that apply)
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {[
                "Personal savings",
                "Family & friends",
                "SACCO loan or shares",
                "Commercial bank loan",
                "Microfinance institution",
                "Angel investor or venture capital",
                "Revenue reinvestment (bootstrapped)",
                "Government grant or fund (e.g., Uwezo Fund, Youth/Women Enterprise Fund)",
              ].map((item) => (
                <label key={item} className={optionClass}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.fundingHistory.includes(item)}
                    onChange={(e) => toggleMulti("fundingHistory", item, e.target.checked)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <label className="block text-sm text-light-100">
            2. What is your primary source of capital today?
            <input
              className={inputClass}
              value={formData.primaryCapitalSource}
              onChange={(e) => setFormData({ ...formData, primaryCapitalSource: e.target.value })}
              required
            />
          </label>

          <label className="block text-sm text-light-100">
            3. Have you ever applied for a bank loan for your business?
            <select
              className={inputClass}
              value={formData.bankLoanExperience}
              onChange={(e) => setFormData({ ...formData, bankLoanExperience: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option>Yes, and it was approved</option>
              <option>Yes, but was rejected</option>
              <option>Yes, but the terms were unfavourable so I declined.</option>
              <option>No, I have never applied</option>
              <option>No, I didn&apos;t think I would qualify</option>
            </select>
          </label>

          <div>
            <p className="text-sm text-light-100">
              4. If you faced challenges accessing capital, what were the main barriers? (Select
              all that apply)
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {[
                "Lack of collateral / security",
                "High interest rates",
                "Complex application process",
                "Business too young / no credit history",
                "No CRB clearance",
                "Didn't know where to apply",
                "I have not faced challenges accessing capital",
                "Other",
              ].map((item) => (
                <label key={item} className={optionClass}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.barriers.includes(item)}
                    onChange={(e) => toggleMulti("barriers", item, e.target.checked)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {formData.barriers.includes("Other") && (
            <label className="block text-sm text-light-100">
              Other barrier
              <input
                className={inputClass}
                value={formData.barriersOther}
                onChange={(e) => setFormData({ ...formData, barriersOther: e.target.value })}
              />
            </label>
          )}

          <label className="block text-sm text-light-100">
            5. How much capital are you currently looking to raise?
            <select
              className={inputClass}
              value={formData.targetRaiseAmount}
              onChange={(e) => setFormData({ ...formData, targetRaiseAmount: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option>Under KES 500,000</option>
              <option>KES 500,000 - 5 million</option>
              <option>KES 20 million - 100 million</option>
              <option>Over 100 million</option>
              <option>Not Actively Seeking Capital Right Now</option>
            </select>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">SECTION 3: Knowledge of Capital Markets</h2>

          <label className="block text-sm text-light-100">
            1. How familiar are you with capital markets in Kenya?
            <select
              className={inputClass}
              value={formData.capitalMarketFamiliarity}
              onChange={(e) =>
                setFormData({ ...formData, capitalMarketFamiliarity: e.target.value })
              }
              required
            >
              <option value="">Select</option>
              <option>Not familiar at all — I&apos;ve never heard of them</option>
              <option>I&apos;ve heard of them but don&apos;t understand how they work</option>
              <option>I have basic knowledge (e.g., I know what shares/bonds are)</option>
              <option>I have moderate knowledge (e.g., I understand how the NSE works)</option>
              <option>I am well-informed — I actively follow capital markets</option>
            </select>
          </label>

          <div>
            <p className="text-sm text-light-100">
              2. Have you ever invested in any of the following? (Select all that apply)
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {[
                "Nairobi Securities Exchange (NSE) shares",
                "Government bonds or T-bills",
                "Unit trusts or money market funds",
                "SACCOs or cooperatives",
                "Real estate",
                "Cryptocurrency or digital assets",
                "None of the above",
              ].map((item) => (
                <label key={item} className={optionClass}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.investedProducts.includes(item)}
                    onChange={(e) => toggleMulti("investedProducts", item, e.target.checked)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          <label className="block text-sm text-light-100">
            3. Have you ever considered listing your company on a stock exchange?
            <select
              className={inputClass}
              value={formData.listingConsideration}
              onChange={(e) => setFormData({ ...formData, listingConsideration: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option>Yes, it&apos;s something I actively want to pursue</option>
              <option>Yes, I&apos;ve thought about it but don&apos;t know how</option>
              <option>Possibly, but I assumed it&apos;s only for large companies</option>
              <option>No, it doesn&apos;t seem relevant for my business</option>
              <option>No, I don&apos;t trust the process</option>
              <option>Option 6</option>
            </select>
          </label>

          <div>
            <p className="text-sm text-light-100">
              4. What is your biggest concern about opening your business to outside investors?
              (Select all that apply)
            </p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {[
                "Losing control of the business",
                "Sharing financial information publicly",
                "Legal and compliance complexity",
                "I have no major concerns",
                "Other",
              ].map((item) => (
                <label key={item} className={optionClass}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.investorConcerns.includes(item)}
                    onChange={(e) => toggleMulti("investorConcerns", item, e.target.checked)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>

          {formData.investorConcerns.includes("Other") && (
            <label className="block text-sm text-light-100">
              Other concern
              <input
                className={inputClass}
                value={formData.investorConcernsOther}
                onChange={(e) => setFormData({ ...formData, investorConcernsOther: e.target.value })}
              />
            </label>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">SECTION 4: Open Feedback</h2>
          <label className="block text-sm text-light-100">
            1. In your own words, what is the biggest challenge your business faces when trying to
            grow?
            <textarea
              className={inputClass}
              rows={3}
              value={formData.growthChallenge}
              onChange={(e) => setFormData({ ...formData, growthChallenge: e.target.value })}
              required
            />
          </label>
          <label className="block text-sm text-light-100">
            2. What would make you comfortable using a digital platform to raise capital for your
            business?
            <textarea
              className={inputClass}
              rows={3}
              value={formData.digitalPlatformComfort}
              onChange={(e) =>
                setFormData({ ...formData, digitalPlatformComfort: e.target.value })
              }
              required
            />
          </label>
          <label className="block text-sm text-light-100">
            3. Would you be interested in joining the NBX pilot program?
            <select
              className={inputClass}
              value={formData.pilotInterest}
              onChange={(e) => setFormData({ ...formData, pilotInterest: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option>Yes - please contact me</option>
              <option>Maybe - I&apos;d like more information first</option>
              <option>No - not at this time</option>
            </select>
          </label>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Contact (Optional)</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-light-100">
              Phone
              <input
                className={inputClass}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </label>
            <label className="text-sm text-light-100">
              Email
              <input
                className={inputClass}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>
          </div>
          <div>
            <p className="text-sm text-light-100">Preferred Contact</p>
            <div className="mt-2 grid gap-2 md:grid-cols-4">
              {["Email", "Phone", "Mail", "WhatsApp"].map((item) => (
                <label key={item} className={optionClass}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.preferredContact.includes(item)}
                    onChange={(e) => toggleMulti("preferredContact", item, e.target.checked)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-dark-100 p-4">
          <h2 className="text-lg font-semibold text-primary">
            INFORMATION SECTION: Capital Alternatives for Your Business
          </h2>
          <p className="mt-2 text-sm text-light-200">
            Informed entrepreneurs make powerful decisions. Read on to learn about two powerful
            tools NBX makes available.
          </p>

          <h3 className="mt-4 text-base font-semibold text-white">
            Bonds: A Cheaper Alternative to Bank Loans
          </h3>
          <p className="mt-2 text-sm text-light-200">
            A bond is a loan you take from the public (investors), not from a bank.
          </p>
          <p className="mt-2 text-sm text-light-100">Corporate Bonds Vs Bank Loans - How it works</p>
          <ul className="mt-2 space-y-1 text-sm text-light-200">
            <li>Your business issues a bond (a promise to repay investors with interest).</li>
            <li>Investors buy the bond, effectively lending you money.</li>
            <li>You pay periodic interest (coupon payments).</li>
            <li>At maturity, you repay the principal.</li>
          </ul>
          <p className="mt-3 text-sm text-light-100">Why bonds can be better than loans:</p>
          <ul className="mt-2 space-y-1 text-sm text-light-200">
            <li>
              Lower cost: by cutting out the bank as middleman, you can offer investors 10%
              interest while a bank may charge 16%.
            </li>
            <li>No collateral required in most cases.</li>
            <li>You set the terms: repayment period, interest rate, and conditions.</li>
            <li>Builds credibility through maturity and transparency.</li>
          </ul>
          <p className="mt-2 text-sm text-light-200">
            On NBX, SMEs can issue tokenized bonds on the Hedera blockchain, making the process
            faster, cheaper, and accessible to hundreds of investors at once.
          </p>

          <h3 className="mt-4 text-base font-semibold text-white">
            Equity Offerings: Raise Capital by Sharing Ownership
          </h3>
          <p className="mt-2 text-sm text-light-200">
            An equity offering means selling a portion of your company&apos;s ownership (shares) to
            investors in exchange for capital.
          </p>
          <p className="mt-2 text-sm text-light-100">How it works</p>
          <ul className="mt-2 space-y-1 text-sm text-light-200">
            <li>You decide what percent of your company to offer (e.g., 20%).</li>
            <li>Investors buy those shares and become part-owners.</li>
            <li>You receive the capital immediately with no repayment obligation.</li>
            <li>Investors benefit if your business grows and share value rises.</li>
          </ul>
          <p className="mt-3 text-sm text-light-100">Types of equity on NBX</p>
          <ul className="mt-2 space-y-1 text-sm text-light-200">
            <li>
              Security Token Offering (STO): shares are tokenized, fractional, tradeable, and open
              to thousands of investors.
            </li>
            <li>Dividend rights: profits can be shared automatically via smart contracts.</li>
            <li>Governance rights: shareholders can vote on major business decisions.</li>
          </ul>
          <p className="mt-2 text-sm text-light-200">
            NBX makes equity raising accessible to SMEs that would not qualify to list on the
            traditional Nairobi Securities Exchange, with lower costs, faster processing, and
            built-in compliance.
          </p>

          <p className="mt-4 text-sm text-light-100">
            Thank you for your time. Your responses will directly influence how NBX is designed to
            serve businesses like yours.
          </p>
          <p className="mt-1 text-xs text-light-200">
            This survey is confidential. Data is used solely for NBX platform development purposes.
          </p>
          <p className="mt-1 text-xs text-light-200">
            Nairobi Block Exchange (NBX) | Building Africa&apos;s Capital Markets for Everyone |
            www.nbx-exchange.co.ke | info@nbx-exchange.co.ke
          </p>
          <p className="mt-2 text-xs text-light-200">
            NSE Announcement on YouTube: add official link here.
          </p>
        </section>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-md bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Survey
        </button>

        {submitted && (
          <p className="rounded-md border border-green-700 bg-green-900/20 px-3 py-2 text-sm text-green-300">
            Thank you. Your response has been saved on this browser.
          </p>
        )}
      </form>
    </div>
  );
}
