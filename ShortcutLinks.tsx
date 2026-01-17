import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Settings, Upload, X, Save, Link, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface ShortcutLink {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
}

const defaultShortcuts: ShortcutLink[] = [
  {
    id: 'ppdb',
    name: 'PPDB',
    url: 'https://script.google.com/a/macros/admin.paud.belajar.id/s/AKfycbxXADFTW-6LkMMoi4X4k681iBwbpR-Bd5hVQLVO_rS1p9g6XtC8LfCoBezJQAGvGdM94Q/exec',
    imageUrl: ''
  },
  {
    id: 'bayar',
    name: 'BAYAR',
    url: 'https://docs.google.com/spreadsheets/d/19RX6IWg7JegYv0vO7B-67OK3l4nN_ypaN8WkEXv4EDI/edit?pli=1&gid=385377373#gid=385377373',
    imageUrl: ''
  }
];

interface ShortcutLinksProps {
  isAdmin?: boolean;
}

export function ShortcutLinks({ isAdmin = false }: ShortcutLinksProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutLink[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<ShortcutLink | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shortcutLinks');
    if (saved) {
      setShortcuts(JSON.parse(saved));
    } else {
      setShortcuts(defaultShortcuts);
      localStorage.setItem('shortcutLinks', JSON.stringify(defaultShortcuts));
    }
  }, []);

  const saveShortcuts = (newShortcuts: ShortcutLink[]) => {
    setShortcuts(newShortcuts);
    localStorage.setItem('shortcutLinks', JSON.stringify(newShortcuts));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, shortcutId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newShortcuts = shortcuts.map(s => 
          s.id === shortcutId ? { ...s, imageUrl: reader.result as string } : s
        );
        saveShortcuts(newShortcuts);
        if (editingShortcut?.id === shortcutId) {
          setEditingShortcut({ ...editingShortcut, imageUrl: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = () => {
    if (editingShortcut) {
      const newShortcuts = shortcuts.map(s => 
        s.id === editingShortcut.id ? editingShortcut : s
      );
      saveShortcuts(newShortcuts);
      setEditingShortcut(null);
      setIsEditing(false);
    }
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col gap-3">
      {shortcuts.map((shortcut, index) => (
        <motion.div
          key={shortcut.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + index * 0.1 }}
          className="relative group"
        >
          <button
            onClick={() => openLink(shortcut.url)}
            className="w-full bg-card/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border hover:shadow-xl hover:scale-105 transition-all duration-300 flex flex-col items-center gap-2"
          >
            {shortcut.imageUrl ? (
              <img 
                src={shortcut.imageUrl} 
                alt={shortcut.name}
                className="w-16 h-16 object-contain rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
            <span className="text-sm font-bold text-foreground">{shortcut.name}</span>
          </button>
          
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingShortcut(shortcut);
                  }}
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Edit Pintasan: {shortcut.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <span>📝</span> Nama Pintasan
                    </Label>
                    <Input
                      value={editingShortcut?.name || ''}
                      onChange={(e) => setEditingShortcut(prev => prev ? {...prev, name: e.target.value} : null)}
                      placeholder="Nama pintasan"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Link className="w-4 h-4" /> URL Tujuan
                    </Label>
                    <Input
                      value={editingShortcut?.url || ''}
                      onChange={(e) => setEditingShortcut(prev => prev ? {...prev, url: e.target.value} : null)}
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4" /> Gambar/Logo
                    </Label>
                    <div className="flex items-center gap-4">
                      {editingShortcut?.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={editingShortcut.imageUrl} 
                            alt="Preview"
                            className="w-20 h-20 object-contain rounded-lg border border-border"
                          />
                          <button
                            onClick={() => setEditingShortcut(prev => prev ? {...prev, imageUrl: ''} : null)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setEditingShortcut(prev => prev ? {...prev, imageUrl: reader.result as string} : null);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <Button type="button" variant="outline" className="w-full cursor-pointer" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Gambar
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  <Button onClick={handleSaveEdit} className="w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan Perubahan
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Admin management component untuk Portal Guru
export function ShortcutManager() {
  const [shortcuts, setShortcuts] = useState<ShortcutLink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('shortcutLinks');
    if (saved) {
      setShortcuts(JSON.parse(saved));
    } else {
      setShortcuts(defaultShortcuts);
    }
  }, []);

  const saveShortcuts = (newShortcuts: ShortcutLink[]) => {
    setShortcuts(newShortcuts);
    localStorage.setItem('shortcutLinks', JSON.stringify(newShortcuts));
  };

  const updateShortcut = (id: string, field: keyof ShortcutLink, value: string) => {
    const newShortcuts = shortcuts.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    );
    saveShortcuts(newShortcuts);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, shortcutId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateShortcut(shortcutId, 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewShortcut = () => {
    const newShortcut: ShortcutLink = {
      id: `shortcut_${Date.now()}`,
      name: 'Pintasan Baru',
      url: 'https://example.com',
      imageUrl: ''
    };
    saveShortcuts([...shortcuts, newShortcut]);
    setEditingId(newShortcut.id);
  };

  const deleteShortcut = (id: string) => {
    const newShortcuts = shortcuts.filter(s => s.id !== id);
    saveShortcuts(newShortcuts);
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Link className="w-5 h-5 text-primary" />
          Kelola Pintasan Web
        </h3>
        <Button onClick={addNewShortcut} size="sm">
          + Tambah Pintasan
        </Button>
      </div>

      <div className="space-y-4">
        {shortcuts.map((shortcut) => (
          <div key={shortcut.id} className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {shortcut.imageUrl ? (
                  <div className="relative">
                    <img 
                      src={shortcut.imageUrl} 
                      alt={shortcut.name}
                      className="w-16 h-16 object-contain rounded-lg border border-border"
                    />
                    <button
                      onClick={() => updateShortcut(shortcut.id, 'imageUrl', '')}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, shortcut.id)}
                      className="hidden"
                    />
                    <div className="w-16 h-16 bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                    </div>
                  </label>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Nama</Label>
                  <Input
                    value={shortcut.name}
                    onChange={(e) => updateShortcut(shortcut.id, 'name', e.target.value)}
                    placeholder="Nama pintasan"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <Input
                    value={shortcut.url}
                    onChange={(e) => updateShortcut(shortcut.id, 'url', e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => deleteShortcut(shortcut.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {shortcuts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Belum ada pintasan. Klik "Tambah Pintasan" untuk menambahkan.
        </div>
      )}
    </div>
  );
}