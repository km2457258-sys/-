import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StatusMessage } from '@/components/ui/StatusMessage';
import type { Device } from '@/types/network';

const MAX_NAME_LENGTH = 40;

interface RenameDeviceDialogProps {
  device: Device;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}

export function RenameDeviceDialog({ device, onSave, onClose }: RenameDeviceDialogProps) {
  const [name, setName] = useState(device.name);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('يرجى إدخال اسم لهذا الجهاز.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(trimmed);
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'تعذّر حفظ الاسم.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose} aria-hidden="true" />
      <form
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="rename-device-title"
        className="relative w-full max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-[fadeIn_0.25s_ease-out]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="rename-device-title" className="text-lg font-bold text-slate-100">
              تغيير اسم الجهاز
            </h2>
            <p className="mt-1 text-sm text-slate-400 tabular-nums" dir="ltr">{device.mac}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">اسم الجهاز</span>
          <input
            autoFocus
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100 placeholder:text-slate-600 transition-colors focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            placeholder="مثال: لابتوب والدي"
          />
        </label>

        {error && <StatusMessage tone="error">{error}</StatusMessage>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            إلغاء
          </Button>
          <Button type="submit" loading={saving}>
            حفظ الاسم
          </Button>
        </div>
      </form>
    </div>
  );
}
