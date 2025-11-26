import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Sparkles,
  Send,
  Settings,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';

/**
 * SMART LOAN MANAGER
 * A React application for generating and managing loan balance reports.
 */

// Helper to parse raw Excel/PDF text copy-pasted by user
const parseLedgerData = (rawText) => {
  if (!rawText) return { left: [], right: [] };
  const lines = rawText.split('\n');
  const summary = {};
  lines.forEach(line => {
    const parts = line.split(/\t|,/);
    if (parts.length < 5) return;
    let qty = 0;
    let item = "";
    let packing = "";
    for (let i = parts.length - 1; i >= 0; i--) {
      const val = parts[i].trim();
      if (!isNaN(parseFloat(val)) && qty === 0) {
        qty = parseFloat(val);
      } else if (val && !item) {
        item = val;
      } else if (val && item && !packing) {
        packing = val;
        break;
      }
    }
    if (item) {
      const key = `${item}|${packing}`;
      summary[key] = (summary[key] || 0) + qty;
    }
  });
  const left = [];
  const right = [];
  Object.entries(summary).forEach(([key, qty], idx) => {
    const [item, packing] = key.split('|');
    const entry = { sl: idx + 1, article: item, packing, qty, qtyKg: qty };
    if (idx % 2 === 0) left.push(entry);
    else right.push(entry);
  });
  return { left, right };
};

// Main App Component
export default function App() {
  const [customerName, setCustomerName] = useState("EXPRESS LEATHER PRODUCTS LIMITED");
  const [mode, setMode] = useState("NANPAO");
  const [rawData, setRawData] = useState("");
  const [tableData, setTableData] = useState({ left: [], right: [] });
  const [showSettings, setShowSettings] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const printRef = useRef(null);

  const today = new Date().toLocaleDateString('en-GB');

  useEffect(() => {
    if (rawData) {
      const parsed = parseLedgerData(rawData);
      setTableData(parsed);
    }
  }, [rawData]);

  const handlePrint = () => {
    window.print();
  };

  const totalLeft = tableData.left.reduce((sum, r) => sum + (r.qty || 0), 0);
  const totalRight = tableData.right.reduce((sum, r) => sum + (r.qty || 0), 0);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">Smart Loan Manager</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
          >
            <Printer className="w-5 h-5" />
            Print
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <label className="block mb-2 text-sm">Customer Name:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded border border-gray-600 mb-4"
          />
          <label className="block mb-2 text-sm">Paste Raw Ledger Data:</label>
          <textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Paste your ledger data here..."
            className="w-full h-32 p-2 bg-gray-700 rounded border border-gray-600"
          />
        </div>
      )}

      {/* AI Operations */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="font-medium">AI Operations</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Ask Gemini to modify report or analyze data (e.g., 'Change customer to Apex', 'Draft email')"
            className="flex-1 p-2 bg-gray-700 rounded border border-gray-600"
          />
          <button className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Run
          </button>
        </div>
      </div>

      {/* Report Preview */}
      <div ref={printRef} className="bg-white text-black p-8 rounded-lg print:shadow-none">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">LOAN SUMMARY</h2>
            <p className="text-lg">CUSTOMER: <strong>{customerName}</strong></p>
            <p>DATE: {today}</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setMode("NANPAO")}
              className={`px-4 py-1 rounded ${mode === "NANPAO" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              NANPAO
            </button>
            <button 
              onClick={() => setMode("MS")}
              className={`px-4 py-1 rounded ${mode === "MS" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
            >
              MS
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Table */}
          <div>
            <h3 className="text-center font-bold mb-2 bg-blue-100 py-2">
              {mode === "NANPAO" ? "NANPAO WILL GET FROM EXPRESS" : "MS WILL GET FROM EXPRESS"}
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">SL</th>
                  <th className="border p-2">ARTICLE</th>
                  <th className="border p-2">PACKING</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">QTY (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {tableData.left.length > 0 ? tableData.left.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{row.sl}</td>
                    <td className="border p-2">{row.article}</td>
                    <td className="border p-2">{row.packing}</td>
                    <td className="border p-2 text-center">{row.qty}</td>
                    <td className="border p-2 text-center">{row.qtyKg} Kg</td>
                  </tr>
                )) : [1,2,3].map(i => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{i}</td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td className="border p-2" colSpan={3}>TOTAL</td>
                  <td className="border p-2 text-center">{totalLeft}</td>
                  <td className="border p-2 text-center">{totalLeft} Kg</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right Table */}
          <div>
            <h3 className="text-center font-bold mb-2 bg-blue-100 py-2">
              EXPRESS WILL GET FROM {mode}
            </h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2">SL</th>
                  <th className="border p-2">ARTICLE</th>
                  <th className="border p-2">PACKING</th>
                  <th className="border p-2">QTY</th>
                  <th className="border p-2">QTY (Kg)</th>
                </tr>
              </thead>
              <tbody>
                {tableData.right.length > 0 ? tableData.right.map((row, i) => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{row.sl}</td>
                    <td className="border p-2">{row.article}</td>
                    <td className="border p-2">{row.packing}</td>
                    <td className="border p-2 text-center">{row.qty}</td>
                    <td className="border p-2 text-center">{row.qtyKg} Kg</td>
                  </tr>
                )) : [1,2,3].map(i => (
                  <tr key={i}>
                    <td className="border p-2 text-center">{i}</td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                    <td className="border p-2"></td>
                  </tr>
                ))}
                <tr className="font-bold bg-gray-100">
                  <td className="border p-2" colSpan={3}>TOTAL</td>
                  <td className="border p-2 text-center">{totalRight}</td>
                  <td className="border p-2 text-center">{totalRight} Kg</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between mt-8 text-sm text-gray-600">
          <span>Authorized Signature</span>
          <span>Generated by Smart Loan Manager</span>
        </div>
      </div>
    </div>
  );
}
