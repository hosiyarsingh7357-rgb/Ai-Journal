import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative w-full max-w-2xl bg-surface border border-border rounded-[2.5rem] shadow-premium overflow-hidden",
              className
            )}
          >
            <div className="p-8 border-b border-border flex items-center justify-between">
              {title && <h2 className="text-xl font-black text-text-primary tracking-tight">{title}</h2>}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface-muted rounded-xl transition-colors text-text-secondary hover:text-status-danger"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 max-h-[80vh] overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
