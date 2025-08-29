'use client';

import { motion } from 'framer-motion';
import { Wand2, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LoadingStatesProps {
  type: 'generating' | 'saving' | 'loading';
  message?: string;
  progress?: number;
}

export function LoadingStates({ type, message, progress }: LoadingStatesProps) {
  const getIcon = () => {
    switch (type) {
      case 'generating':
        return Wand2;
      case 'saving':
        return TrendingUp;
      default:
        return BarChart3;
    }
  };

  const getDefaultMessage = () => {
    switch (type) {
      case 'generating':
        return 'Generating AI scenarios...';
      case 'saving':
        return 'Saving your data...';
      default:
        return 'Loading...';
    }
  };

  const Icon = getIcon();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Icon className="h-8 w-8 mx-auto text-primary" />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="font-medium">{message || getDefaultMessage()}</h3>
            
            {type === 'generating' && (
              <motion.p 
                className="text-sm text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Analyzing your preferences and constraints...
              </motion.p>
            )}
            
            {progress !== undefined && (
              <div className="space-y-2 max-w-xs mx-auto">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground">{progress}% complete</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SuccessAnimation({ message = "Success!" }: { message?: string }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: "backOut" }}
      className="text-center p-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2"
      >
        <motion.svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </motion.div>
      <p className="text-green-600 font-medium">{message}</p>
    </motion.div>
  );
}