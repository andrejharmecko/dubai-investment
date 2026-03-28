import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, ComposedChart, ReferenceLine } from "recharts";

const COLORS = {
  blue: "#3B82F6", green: "#10B981", red: "#EF4444", amber: "#F59E0B",
  purple: "#8B5CF6", indigo: "#6366F1", cyan: "#06B6D4", pink: "#EC4899",
  slate: "#64748B", emerald: "#059669", orange: "#F97316",
  bgDark: "#0F172A", bgCard: "#1E293B", bgInput: "#334155",
  textPrimary: "#F1F5F9", textSecondary: "#94A3B8", border: "#475569"
};

const PIE_COLORS = [COLORS.green, COLORS.red, COLORS.amber, COLORS.blue, COLORS.purple];

function pmt(rate, nper, pv) {
  if (rate === 0) return -pv / nper;
  const r = rate;
  return (pv * r * Math.pow(1 + r, nper)) / (Math.pow(1 + r, nper) - 1);
}

function formatNum(n, decimals = 0) {
  if (n === undefined || n === null || isNaN(n)) return "—";
  const abs = Math.abs(n);
  if (abs >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (abs >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function formatCZK(n) { return formatNum(n) + " CZK"; }
function formatAED(n) { return formatNum(n) + " AED"; }

function SliderInput({ label, value, onChange, min, max, step, unit, tooltip }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>{label}</label>
        <span className="text-sm font-bold" style={{ color: COLORS.blue }}>
          {unit === "%" ? (value * 100).toFixed(1) + "%" : formatNum(value)} {unit && unit !== "%" ? unit : ""}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, ${COLORS.blue} ${((value - min) / (max - min)) * 100}%, ${COLORS.bgInput} ${((value - min) / (max - min)) * 100}%)` }}
      />
    </div>
  );
}

function MetricCard({ label, value, subtext, color = COLORS.blue, icon }) {
  return (
    <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-xs font-medium" style={{ color: COLORS.textSecondary }}>{label}</p>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      {subtext && <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>{subtext}</p>}
    </div>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <h2 className="text-lg font-bold mt-8 mb-4 flex items-center gap-2" style={{ color: COLORS.textPrimary }}>
      {icon && <span>{icon}</span>}{children}
    </h2>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg p-3 border text-xs" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
      <p className="font-bold mb-1" style={{ color: COLORS.textPrimary }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {formatNum(p.value)}</p>
      ))}
    </div>
  );
};

export default function DubaiDashboard() {
  // Editable assumptions
  const [fx, setFx] = useState(6.0);
  const [salary, setSalary] = useState(45000);
  const [companyProfit, setCompanyProfit] = useState(1000000);
  const [czRent, setCzRent] = useState(15000);
  const [debtParents, setDebtParents] = useState(2000000);
  const [czMortgage, setCzMortgage] = useState(1100000);
  const [pbtYield, setPbtYield] = useState(0.055);
  const [avYield, setAvYield] = useState(0.07);
  const [appreciation, setAppreciation] = useState(0.03);
  const [mortgageRate, setMortgageRate] = useState(0.0499);
  const [ltv, setLtv] = useState(0.60);
  const [tenureYears, setTenureYears] = useState(20);
  const [netFactor, setNetFactor] = useState(0.70);

  // Fixed property data
  const PBT_PRICE = 1406322;
  const PBT_PAID = 941322;
  const PBT_REMAINING = 465000;
  const AV_PRICE = 1604000;
  const AV_PAID = 393660;
  const AV_REMAINING = 1283200;

  const calc = useMemo(() => {
    const tenureMonths = tenureYears * 12;
    const monthlyRate = mortgageRate / 12;

    // PBT Mortgage
    const pbtMortAmt = PBT_PRICE * ltv;
    const pbtMonthlyPmt = pmt(monthlyRate, tenureMonths, pbtMortAmt);
    const pbtTotalPaid = pbtMonthlyPmt * tenureMonths;
    const pbtTotalInterest = pbtTotalPaid - pbtMortAmt;
    const pbtGrossRentMo = PBT_PRICE * pbtYield / 12;
    const pbtNetRentMo = pbtGrossRentMo * netFactor;
    const pbtCashFlow = pbtNetRentMo - pbtMonthlyPmt;
    const pbtCoverage = pbtNetRentMo / pbtMonthlyPmt;

    // Avenew Mortgage
    const avMortAmt = AV_PRICE * ltv;
    const avMonthlyPmt = pmt(monthlyRate, tenureMonths, avMortAmt);
    const avTotalPaid = avMonthlyPmt * tenureMonths;
    const avTotalInterest = avTotalPaid - avMortAmt;
    const avGrossRentMo = AV_PRICE * avYield / 12;
    const avNetRentMo = avGrossRentMo * netFactor;
    const avCashFlow = avNetRentMo - avMonthlyPmt;
    const avCoverage = avNetRentMo / avMonthlyPmt;

    // Combined
    const combMonthlyPmt = pbtMonthlyPmt + avMonthlyPmt;
    const combNetRent = pbtNetRentMo + avNetRentMo;
    const combCashFlow = combNetRent - combMonthlyPmt;
    const combTotalInterest = pbtTotalInterest + avTotalInterest;

    // 10-year ROI
    const pbtEquity = PBT_PRICE * (1 - ltv);
    const avEquity = AV_PRICE * (1 - ltv);
    const totalEquity = pbtEquity + avEquity;

    const roiData = [];
    let pbtVal = PBT_PRICE, avVal = AV_PRICE;
    let pbtCumCF = 0, avCumCF = 0;

    for (let yr = 0; yr <= 10; yr++) {
      if (yr > 0) {
        pbtVal *= (1 + appreciation);
        avVal *= (1 + appreciation);
        const pbtNetYr = pbtVal * pbtYield * netFactor - pbtMonthlyPmt * 12;
        const avNetYr = avVal * avYield * netFactor - avMonthlyPmt * 12;
        pbtCumCF += pbtNetYr;
        avCumCF += avNetYr;
      }
      const pbtReturn = (pbtVal - PBT_PRICE) + pbtCumCF;
      const avReturn = (avVal - AV_PRICE) + avCumCF;
      roiData.push({
        year: 2027 + yr,
        pbtValue: Math.round(pbtVal),
        avValue: Math.round(yr === 0 ? 0 : avVal),
        combined: Math.round(pbtVal + (yr === 0 ? 0 : avVal)),
        pbtCumCF: Math.round(pbtCumCF),
        avCumCF: Math.round(yr === 0 ? 0 : avCumCF),
        combinedCF: Math.round(pbtCumCF + (yr === 0 ? 0 : avCumCF)),
        pbtROI: yr === 0 ? 0 : (pbtReturn / pbtEquity * 100),
        avROI: yr === 0 ? 0 : (avReturn / avEquity * 100),
        totalReturn: Math.round(pbtReturn + avReturn),
      });
    }

    const yr10 = roiData[10];
    const totalAppreciation = (yr10.pbtValue + yr10.avValue) - (PBT_PRICE + AV_PRICE);
    const totalNetCF = yr10.combinedCF;
    const totalReturn10 = totalAppreciation + totalNetCF;
    const roiOnEquity = totalReturn10 / totalEquity;
    const annualizedReturn = Math.pow(1 + roiOnEquity, 1 / 10) - 1;

    // Payments timeline
    const payments = [
      { date: "Aug 2026", aed: 160400, czk: 160400 * fx, property: "Avenew", desc: "3rd Installment", status: "due" },
      { date: "Feb 2027", aed: 160400, czk: 160400 * fx, property: "Avenew", desc: "4th Installment", status: "due" },
      { date: "Mar 2027", aed: 465000, czk: 465000 * fx, property: "PBT 50%", desc: "Handover", status: "due" },
      { date: "Aug 2027", aed: 160400, czk: 160400 * fx, property: "Avenew", desc: "5th Installment", status: "due" },
      { date: "Feb 2028", aed: 802000, czk: 802000 * fx, property: "Avenew", desc: "Handover", status: "due" },
    ];

    // Monthly cash flow chart data
    const cfComparison = [
      { name: "Gross Rent", pbt: Math.round(pbtGrossRentMo), avenew: Math.round(avGrossRentMo) },
      { name: "Net Rent", pbt: Math.round(pbtNetRentMo), avenew: Math.round(avNetRentMo) },
      { name: "Mortgage", pbt: Math.round(-pbtMonthlyPmt), avenew: Math.round(-avMonthlyPmt) },
      { name: "Cash Flow", pbt: Math.round(pbtCashFlow), avenew: Math.round(avCashFlow) },
    ];

    // Pie data
    const paidVsRemaining = [
      { name: "Paid", value: PBT_PAID + AV_PAID },
      { name: "Remaining", value: PBT_REMAINING + AV_REMAINING },
    ];

    const remainingBreakdown = [
      { name: "PBT Handover", value: 465000 },
      { name: "AV Installments", value: 481200 },
      { name: "AV Handover", value: 802000 },
    ];

    return {
      pbt: { mortAmt: pbtMortAmt, monthlyPmt: pbtMonthlyPmt, totalInterest: pbtTotalInterest, grossRentMo: pbtGrossRentMo, netRentMo: pbtNetRentMo, cashFlow: pbtCashFlow, coverage: pbtCoverage, equity: pbtEquity },
      av: { mortAmt: avMortAmt, monthlyPmt: avMonthlyPmt, totalInterest: avTotalInterest, grossRentMo: avGrossRentMo, netRentMo: avNetRentMo, cashFlow: avCashFlow, coverage: avCoverage, equity: avEquity },
      combined: { monthlyPmt: combMonthlyPmt, netRent: combNetRent, cashFlow: combCashFlow, totalInterest: combTotalInterest },
      totalEquity, totalAppreciation, totalNetCF, totalReturn10, roiOnEquity, annualizedReturn,
      roiData, payments, cfComparison, paidVsRemaining, remainingBreakdown,
    };
  }, [fx, salary, companyProfit, czRent, pbtYield, avYield, appreciation, mortgageRate, ltv, tenureYears, netFactor]);

  return (
    <div className="min-h-screen p-4 md:p-6" style={{ background: COLORS.bgDark, color: COLORS.textPrimary }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-1" style={{ color: COLORS.textPrimary }}>Dubai Investment Dashboard</h1>
          <p className="text-sm" style={{ color: COLORS.textSecondary }}>Palm Beach Towers (50% share) + Avenew 888 — Interactive Model</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <MetricCard icon="🏠" label="Portfolio Value" value={formatAED(PBT_PRICE + AV_PRICE)} subtext={formatCZK((PBT_PRICE + AV_PRICE) * fx)} color={COLORS.blue} />
          <MetricCard icon="💰" label="Remaining to Pay" value={formatAED(PBT_REMAINING + AV_REMAINING)} subtext={formatCZK((PBT_REMAINING + AV_REMAINING) * fx)} color={COLORS.red} />
          <MetricCard icon="📊" label="Monthly Shortfall" value={formatAED(Math.round(Math.abs(calc.combined.cashFlow)))} subtext={formatCZK(Math.round(Math.abs(calc.combined.cashFlow) * fx)) + "/mo"} color={calc.combined.cashFlow >= 0 ? COLORS.green : COLORS.amber} />
          <MetricCard icon="🎯" label="10yr ROI on Equity" value={(calc.roiOnEquity * 100).toFixed(1) + "%"} subtext={"Annualized: " + (calc.annualizedReturn * 100).toFixed(1) + "%"} color={COLORS.green} />
          <MetricCard icon="🔑" label="Equity Invested" value={formatAED(Math.round(calc.totalEquity))} subtext={formatCZK(Math.round(calc.totalEquity * fx))} color={COLORS.purple} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* LEFT: Controls */}
          <div className="lg:col-span-1">
            <div className="rounded-xl p-4 border sticky top-4" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: COLORS.textPrimary }}>
                <span>⚙️</span> Assumptions
              </h3>

              <p className="text-xs font-semibold mb-2 mt-2" style={{ color: COLORS.cyan }}>EXCHANGE & INCOME</p>
              <SliderInput label="CZK/AED Rate" value={fx} onChange={setFx} min={4} max={8} step={0.1} />
              <SliderInput label="Monthly Savings" value={salary} onChange={setSalary} min={20000} max={80000} step={5000} unit="CZK" />
              <SliderInput label="Company Profit/yr" value={companyProfit} onChange={setCompanyProfit} min={0} max={3000000} step={100000} unit="CZK" />

              <p className="text-xs font-semibold mb-2 mt-4" style={{ color: COLORS.cyan }}>RENTAL YIELDS</p>
              <SliderInput label="PBT Gross Yield" value={pbtYield} onChange={setPbtYield} min={0.03} max={0.09} step={0.005} unit="%" />
              <SliderInput label="Avenew Gross Yield" value={avYield} onChange={setAvYield} min={0.04} max={0.12} step={0.005} unit="%" />
              <SliderInput label="Net Rental Factor" value={netFactor} onChange={setNetFactor} min={0.5} max={0.85} step={0.05} unit="%" />

              <p className="text-xs font-semibold mb-2 mt-4" style={{ color: COLORS.cyan }}>MARKET & MORTGAGE</p>
              <SliderInput label="Annual Appreciation" value={appreciation} onChange={setAppreciation} min={-0.05} max={0.1} step={0.005} unit="%" />
              <SliderInput label="Mortgage Rate" value={mortgageRate} onChange={setMortgageRate} min={0.03} max={0.08} step={0.001} unit="%" />
              <SliderInput label="LTV" value={ltv} onChange={setLtv} min={0.4} max={0.75} step={0.05} unit="%" />
              <SliderInput label="Tenure" value={tenureYears} onChange={setTenureYears} min={10} max={25} step={1} unit="yrs" />

              <p className="text-xs font-semibold mb-2 mt-4" style={{ color: COLORS.cyan }}>DEBTS</p>
              <SliderInput label="Owed to Parents" value={debtParents} onChange={setDebtParents} min={0} max={3000000} step={100000} unit="CZK" />
              <SliderInput label="CZ Mortgage Left" value={czMortgage} onChange={setCzMortgage} min={0} max={2000000} step={100000} unit="CZK" />
            </div>
          </div>

          {/* RIGHT: Charts & Data */}
          <div className="lg:col-span-3 space-y-6">

            {/* Property Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: "Palm Beach Towers (50%)", loc: "Palm Jumeirah, 22nd fl, 1BR", price: PBT_PRICE, paid: PBT_PAID, remain: PBT_REMAINING, d: calc.pbt, yld: pbtYield, handover: "Spring 2027", color: COLORS.blue },
                { name: "Avenew 888", loc: "Dubai South, 2BR, 800sqft", price: AV_PRICE, paid: AV_PAID, remain: AV_REMAINING, d: calc.av, yld: avYield, handover: "Feb 2028", color: COLORS.amber },
              ].map((p, i) => (
                <div key={i} className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: p.color + "40" }}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: p.color }}>{p.name}</h3>
                      <p className="text-xs" style={{ color: COLORS.textSecondary }}>{p.loc}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: p.color + "20", color: p.color }}>
                      Handover: {p.handover}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span style={{ color: COLORS.textSecondary }}>Price:</span> <span className="font-bold">{formatAED(p.price)}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Paid:</span> <span className="font-bold" style={{ color: COLORS.green }}>{formatAED(p.paid)}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Remaining:</span> <span className="font-bold" style={{ color: COLORS.red }}>{formatAED(p.remain)}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Yield:</span> <span className="font-bold">{(p.yld * 100).toFixed(1)}%</span></div>
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2 text-xs" style={{ borderColor: COLORS.border }}>
                    <div><span style={{ color: COLORS.textSecondary }}>Mortgage:</span> <span className="font-bold">{formatAED(Math.round(p.d.mortAmt))}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Monthly Pmt:</span> <span className="font-bold">{formatAED(Math.round(p.d.monthlyPmt))}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Net Rent/mo:</span> <span className="font-bold" style={{ color: COLORS.green }}>{formatAED(Math.round(p.d.netRentMo))}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Cash Flow:</span> <span className="font-bold" style={{ color: p.d.cashFlow >= 0 ? COLORS.green : COLORS.red }}>{formatAED(Math.round(p.d.cashFlow))}</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Coverage:</span> <span className="font-bold" style={{ color: p.d.coverage >= 1 ? COLORS.green : COLORS.amber }}>{(p.d.coverage * 100).toFixed(0)}%</span></div>
                    <div><span style={{ color: COLORS.textSecondary }}>Interest 20yr:</span> <span className="font-bold" style={{ color: COLORS.red }}>{formatAED(Math.round(p.d.totalInterest))}</span></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Status Pies */}
            <SectionTitle icon="📅">Payment Status</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
                <h4 className="text-sm font-bold mb-2" style={{ color: COLORS.textSecondary }}>Paid vs Remaining</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={calc.paidVsRemaining} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {calc.paidVsRemaining.map((_, i) => <Cell key={i} fill={[COLORS.green, COLORS.red][i]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatNum(v) + " AED"} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
                <h4 className="text-sm font-bold mb-2" style={{ color: COLORS.textSecondary }}>Remaining by Category</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={calc.remainingBreakdown} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {calc.remainingBreakdown.map((_, i) => <Cell key={i} fill={[COLORS.blue, COLORS.amber, COLORS.orange][i]} />)}
                    </Pie>
                    <Tooltip formatter={v => formatNum(v) + " AED"} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Timeline */}
            <SectionTitle icon="🗓️">Upcoming Payments</SectionTitle>
            <div className="rounded-xl border overflow-hidden" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: COLORS.indigo }}>
                    {["Date", "Property", "Description", "AED", "CZK", "Status"].map(h => (
                      <th key={h} className="px-3 py-2 text-left font-semibold" style={{ color: "white" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {calc.payments.map((p, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-3 py-2 font-medium">{p.date}</td>
                      <td className="px-3 py-2">{p.property}</td>
                      <td className="px-3 py-2">{p.desc}</td>
                      <td className="px-3 py-2 font-bold" style={{ color: COLORS.blue }}>{formatNum(p.aed)}</td>
                      <td className="px-3 py-2" style={{ color: COLORS.textSecondary }}>{formatNum(Math.round(p.aed * fx))}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: COLORS.red + "20", color: COLORS.red }}>DUE</span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t font-bold" style={{ borderColor: COLORS.border, background: COLORS.bgInput }}>
                    <td className="px-3 py-2" colSpan={3}>TOTAL REMAINING</td>
                    <td className="px-3 py-2" style={{ color: COLORS.red }}>{formatNum(calc.payments.reduce((s, p) => s + p.aed, 0))}</td>
                    <td className="px-3 py-2" style={{ color: COLORS.red }}>{formatNum(Math.round(calc.payments.reduce((s, p) => s + p.aed, 0) * fx))}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payments Bar Chart */}
            <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <h4 className="text-sm font-bold mb-3" style={{ color: COLORS.textSecondary }}>Payment Timeline (AED)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={calc.payments}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="date" tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="aed" name="Amount (AED)" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Cash Flow */}
            <SectionTitle icon="💵">Monthly Rental vs Mortgage (AED)</SectionTitle>
            <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={calc.cfComparison} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="name" tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={0} stroke={COLORS.textSecondary} />
                  <Bar dataKey="pbt" name="PBT 50%" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avenew" name="Avenew" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Property Value Growth */}
            <SectionTitle icon="📈">10-Year Property Value (AED)</SectionTitle>
            <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={calc.roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="year" tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="pbtValue" name="PBT Value" stroke={COLORS.blue} fill={COLORS.blue + "30"} strokeWidth={2} />
                  <Area type="monotone" dataKey="avValue" name="Avenew Value" stroke={COLORS.amber} fill={COLORS.amber + "30"} strokeWidth={2} />
                  <Area type="monotone" dataKey="combined" name="Combined" stroke={COLORS.green} fill={COLORS.green + "20"} strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Cumulative Cash Flow */}
            <SectionTitle icon="🔄">Cumulative Net Cash Flow (AED)</SectionTitle>
            <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={calc.roiData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="year" tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <ReferenceLine y={0} stroke={COLORS.textSecondary} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="pbtCumCF" name="PBT CF" stroke={COLORS.blue} strokeWidth={2} dot={{ fill: COLORS.blue, r: 3 }} />
                  <Line type="monotone" dataKey="avCumCF" name="Avenew CF" stroke={COLORS.amber} strokeWidth={2} dot={{ fill: COLORS.amber, r: 3 }} />
                  <Area type="monotone" dataKey="combinedCF" name="Combined" stroke={COLORS.green} fill={COLORS.green + "20"} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* 10-Year Return Summary */}
            <SectionTitle icon="🏆">10-Year Return Breakdown (AED)</SectionTitle>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Capital Appreciation" value={formatAED(Math.round(calc.totalAppreciation))} color={COLORS.green} />
              <MetricCard label="Net Rental Income" value={formatAED(Math.round(calc.totalNetCF))} color={COLORS.blue} />
              <MetricCard label="Mortgage Interest (20yr)" value={formatAED(Math.round(calc.combined.totalInterest))} color={COLORS.red} />
              <MetricCard label="Net Total Return" value={formatAED(Math.round(calc.totalReturn10))} subtext={formatCZK(Math.round(calc.totalReturn10 * fx))} color={COLORS.emerald} />
            </div>

            <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: "Appreciation", value: Math.round(calc.totalAppreciation) },
                  { name: "Rental Income", value: Math.round(calc.totalNetCF) },
                  { name: "Interest Cost", value: Math.round(-calc.combined.totalInterest) },
                  { name: "NET RETURN", value: Math.round(calc.totalReturn10) },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="name" tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <YAxis tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke={COLORS.textSecondary} />
                  <Bar dataKey="value" name="AED" radius={[4, 4, 0, 0]}>
                    {[COLORS.green, COLORS.blue, COLORS.red, COLORS.emerald].map((c, i) => <Cell key={i} fill={c} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Debt Overview */}
            <SectionTitle icon="📋">Total Debt Overview</SectionTitle>
            <div className="rounded-xl p-4 border" style={{ background: COLORS.bgCard, borderColor: COLORS.border }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold mb-3" style={{ color: COLORS.textSecondary }}>UAE MORTGAGES (AED)</h4>
                  {[
                    { label: "PBT Mortgage (50%)", value: calc.pbt.mortAmt, pmt: calc.pbt.monthlyPmt },
                    { label: "Avenew Mortgage", value: calc.av.mortAmt, pmt: calc.av.monthlyPmt },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: COLORS.border }}>
                      <div>
                        <p className="text-sm font-medium">{d.label}</p>
                        <p className="text-xs" style={{ color: COLORS.textSecondary }}>{formatAED(Math.round(d.pmt))}/mo</p>
                      </div>
                      <p className="font-bold" style={{ color: COLORS.red }}>{formatAED(Math.round(d.value))}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 mt-1">
                    <p className="text-sm font-bold">Total UAE Mortgages</p>
                    <p className="font-bold" style={{ color: COLORS.red }}>{formatAED(Math.round(calc.pbt.mortAmt + calc.av.mortAmt))}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold mb-3" style={{ color: COLORS.textSecondary }}>CZ OBLIGATIONS (CZK)</h4>
                  {[
                    { label: "Loan from Parents", value: debtParents },
                    { label: "CZ Mortgage", value: czMortgage },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b" style={{ borderColor: COLORS.border }}>
                      <p className="text-sm font-medium">{d.label}</p>
                      <p className="font-bold" style={{ color: COLORS.amber }}>{formatCZK(d.value)}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 mt-1">
                    <p className="text-sm font-bold">Total CZ Debt</p>
                    <p className="font-bold" style={{ color: COLORS.amber }}>{formatCZK(debtParents + czMortgage)}</p>
                  </div>
                  <div className="mt-4 p-3 rounded-lg" style={{ background: COLORS.bgInput }}>
                    <p className="text-xs" style={{ color: COLORS.textSecondary }}>Monthly capacity to repay parents:</p>
                    <p className="text-sm font-bold" style={{ color: COLORS.green }}>
                      ~{formatCZK(salary + czRent - Math.round(Math.abs(calc.combined.cashFlow) * fx))}/mo
                    </p>
                    <p className="text-xs mt-1" style={{ color: COLORS.textSecondary }}>
                      Repayment time: ~{Math.ceil(debtParents / (salary + czRent - Math.abs(calc.combined.cashFlow) * fx))} months
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center py-6 text-xs" style={{ color: COLORS.textSecondary }}>
              <p>For informational purposes only — not financial advice. Consult a licensed advisor before making investment decisions.</p>
              <p className="mt-1">Market data sourced from Knight Frank, JLL, DLD, Bayut, Property Finder (March 2026)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
