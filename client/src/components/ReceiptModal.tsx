import React from 'react';
import Modal from './Modal';
import { Printer, Download, CheckCircle, GraduationCap } from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface ReceiptModalProps {
  open: boolean;
  onClose: () => void;
  receiptData: {
    receiptNumber: string;
    studentName: string;
    studentEmail?: string;
    batchName: string;
    subject?: string;
    amount: number;
    date: string;
    transactionId?: string;
    method?: string;
  } | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  open,
  onClose,
  receiptData,
}) => {
  if (!receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const printContent = document.getElementById('receipt-content');
    if (!printContent) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt-${receiptData.receiptNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            body { font-family: 'Plus Jakarta Sans', sans-serif; padding: 40px; background: #fff; }
            @media print { button { display: none !important; } }
          </style>
        </head>
        <body>
          <div class="max-w-2xl mx-auto">
            ${printContent.innerHTML}
          </div>
          <script>
            setTimeout(() => { window.print(); }, 350);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Modal open={open} onClose={onClose} title="Fee Payment Receipt" size="lg">
      <div id="receipt-content" className="space-y-6">
        {/* Receipt Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 className="font-display font-700 text-slate-800 text-base">
                EduBatch Institute
              </h3>
              <p className="text-xs text-slate-400">Official Fee Receipt</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <CheckCircle size={12} /> PAID
            </span>
            <p className="text-xs font-mono font-medium text-slate-500 mt-1">
              #{receiptData.receiptNumber}
            </p>
          </div>
        </div>

        {/* Student & Date Meta */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
              Billed To
            </span>
            <p className="font-bold text-slate-800 mt-0.5">
              {receiptData.studentName}
            </p>
            {receiptData.studentEmail && (
              <p className="text-slate-500">{receiptData.studentEmail}</p>
            )}
          </div>
          <div>
            <span className="text-slate-400 font-semibold block uppercase text-[10px]">
              Payment Details
            </span>
            <p className="text-slate-800 mt-0.5">
              <span className="font-semibold">Date:</span> {receiptData.date}
            </p>
            <p className="text-slate-800">
              <span className="font-semibold">Method:</span>{' '}
              {receiptData.method || 'Online'}
            </p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <th className="px-4 py-2.5 text-left">Item Description</th>
                <th className="px-4 py-2.5 text-left">Batch / Subject</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3 text-slate-800 font-medium">
                  Course Tuition & Material Fee
                  {receiptData.transactionId && (
                    <span className="block text-[10px] text-slate-400 font-mono">
                      Ref: {receiptData.transactionId}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {receiptData.batchName}
                  {receiptData.subject && (
                    <span className="block text-[10px] text-slate-400">
                      {receiptData.subject}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800">
                  {formatINR(receiptData.amount)}
                </td>
              </tr>
              <tr className="border-t border-slate-200 bg-slate-50/50">
                <td colSpan={2} className="px-4 py-3 font-bold text-slate-800 text-right">
                  Total Paid:
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 text-sm">
                  {formatINR(receiptData.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-400">
            A confirmation receipt has also been emailed to you.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download size={14} />
              <span>Download Invoice</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReceiptModal;
