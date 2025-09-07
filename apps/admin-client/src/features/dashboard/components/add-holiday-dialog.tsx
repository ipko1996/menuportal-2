import React, { useState, useEffect } from 'react';
import { Button } from '@mono-repo/ui/button';
import { Input } from '@mono-repo/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@mono-repo/ui/dialog';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface AddHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: Date;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
}

export function AddHolidayDialog({
  open,
  onOpenChange,
  date,
  onSave,
  isSaving,
}: AddHolidayDialogProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSave(name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Holiday</DialogTitle>
            <DialogDescription>
              Set a holiday for {format(date, 'MMMM d, yyyy')}. This day will be
              marked as closed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              id="holidayName"
              placeholder="e.g., New Year's Day"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !name.trim()}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Holiday
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
