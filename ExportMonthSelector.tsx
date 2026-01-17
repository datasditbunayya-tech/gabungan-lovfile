import { useState } from 'react';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { getMonthOptions } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ExportMonthSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (month: string) => void;
  title: string;
}

export function ExportMonthSelector({ open, onOpenChange, onExport, title }: ExportMonthSelectorProps) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const monthOptions = getMonthOptions();

  const handleExport = () => {
    onExport(selectedMonth);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📥 Download {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pilih Bulan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-field"
            >
              <option value="">Semua Bulan</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
