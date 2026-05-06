"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';

type AlertType = 'success' | 'error' | 'warning';

interface ThemedAlertProps {
    message: string;
    type?: AlertType;
    isOpen: boolean;
    onClose: () => void;
    autoClose?: boolean;
}

export default function ThemedAlert({ message, type = 'success', isOpen, onClose, autoClose = true }: ThemedAlertProps) {
    useEffect(() => {
        if (isOpen && autoClose) {
            const timer = setTimeout(onClose, 5000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose, onClose]);

    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: <CheckCircle2 className="w-5 h-5 text-green-500" />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: <XCircle className="w-5 h-5 text-red-500" />
        },
        warning: {
            bg: 'bg-orange-50',
            border: 'border-orange-200',
            text: 'text-orange-800',
            icon: <AlertCircle className="w-5 h-5 text-orange-500" />
        }
    };

    const currentStyle = styles[type];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed top-6 left-0 right-0 z-[100] flex justify-center pointer-events-none px-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        className={`pointer-events-auto max-w-md w-full ${currentStyle.bg} border ${currentStyle.border} p-4 rounded-2xl shadow-xl flex items-start gap-3`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {currentStyle.icon}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${currentStyle.text}`}>{message}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
