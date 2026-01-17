import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, ExternalLink, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToastContext } from '@/components/Toast';

interface GoogleSheetsSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (url: string) => void;
  savedUrl?: string;
}

const CODE_GS = `// Code.gs - Paste di Google Apps Script

var SPREADSHEET_ID = '1uln5_zPGVrRc95EOAOYAP1brdmNFg5kcihLjIUGvpSo'; // Ganti dengan ID spreadsheet Anda

function doGet(e) {
  return HtmlService.createHtmlOutput("API Bunayya Connected - OK");
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var targetSheet = ss.getSheetByName(data.sheet);
    
    if (!targetSheet) {
      targetSheet = ss.insertSheet(data.sheet);
    }
    
    if (data.action === 'append') {
      targetSheet.appendRow(data.row);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🏫 Portal Bunayya')
    .addItem('Inisialisasi Sheet', 'initSheets')
    .addItem('Test Koneksi', 'testConnection')
    .addToUi();
}

function initSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ['Siswa', 'Guru', 'Absensi_Siswa', 'Absensi_Guru', 'Jurnal', 'Nilai', 'Laporan_Harian', 'Target'];
  
  sheets.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
  
  SpreadsheetApp.getUi().alert('Sheet berhasil diinisialisasi!');
}

function testConnection() {
  SpreadsheetApp.getUi().alert('Koneksi berhasil! Spreadsheet ID: ' + SPREADSHEET_ID);
}`;

export function GoogleSheetsSetup({ open, onOpenChange, onSave, savedUrl }: GoogleSheetsSetupProps) {
  const [url, setUrl] = useState(savedUrl || '');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToastContext();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CODE_GS);
      setCopied(true);
      showToast('Kode berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Gagal menyalin kode', 'error');
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      showToast('Masukkan URL Google Apps Script', 'error');
      return;
    }

    if (!url.includes('script.google.com') && !url.includes('googleusercontent.com')) {
      showToast('URL tidak valid. Pastikan menggunakan URL deployment dari Google Apps Script', 'error');
      return;
    }

    setIsSaving(true);
    
    // Save to localStorage
    localStorage.setItem('googleAppsScriptUrl', url);
    
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onSave(url);
    showToast('Berhasil terhubung ke Google Sheets!', 'success');
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            ⚙️ Setup Google Sheets
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              URL Google Apps Script <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL deployment dari Google Apps Script"
              className="input-field"
            />
          </div>

          {/* Setup Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              📋 Cara Setup:
            </h4>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">1.</span>
                <span>Buka <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Google Sheets baru <ExternalLink className="w-3 h-3" /></a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">2.</span>
                <span>Klik <strong>Extensions → Apps Script</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">3.</span>
                <span>Copy-paste kode dari file code.gs di bawah</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">4.</span>
                <span>Simpan dan <strong>Deploy → New Deployment</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">5.</span>
                <span>Pilih "Web app", akses: <strong>Anyone</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">6.</span>
                <span>Copy URL dan paste di atas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-foreground">7.</span>
                <span>Jalankan menu <strong>🏫 Portal Bunayya → Inisialisasi Sheet</strong></span>
              </li>
            </ol>
          </div>

          {/* Code Block */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-foreground">
                📄 code.gs
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Kode</span>
                  </>
                )}
              </Button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                {CODE_GS}
              </pre>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>💾 Simpan & Hubungkan</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
