import { useState } from 'react';
import { toast } from 'sonner';

interface UseCopyToClipboardReturn {
  copied: boolean;
  copy: (text: string, successMessage?: string) => Promise<boolean>;
}

export function useCopyToClipboard(): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string, successMessage = 'Copied to clipboard!'): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      toast.error('Clipboard not supported in this browser');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      
      // Show success feedback
      toast.success(successMessage, {
        duration: 2000,
        position: 'top-right'
      });

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      
      return true;
    } catch (err) {
      console.warn('Failed to copy text: ', err);
      toast.error('Failed to copy to clipboard');
      setCopied(false);
      return false;
    }
  };

  return { copied, copy };
}