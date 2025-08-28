'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "../shared";
import { Tool } from "@/lib/tools";
import { useState } from "react";

interface CalculatorToolProps {
  tool: Tool;
}

export function CalculatorTool({ tool }: CalculatorToolProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const calculate = (firstOperand: number, secondOperand: number, operation: string) => {
    switch (operation) {
      case '+': return firstOperand + secondOperand;
      case '-': return firstOperand - secondOperand;
      case '*': return firstOperand * secondOperand;
      case '/': return secondOperand !== 0 ? firstOperand / secondOperand : 0;
      default: return secondOperand;
    }
  };

  const handleNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperator);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  return (
    <ToolLayout tool={tool}>
      <Card>
        <CardHeader>
          <CardTitle>Advanced Calculator</CardTitle>
          <CardDescription>
            Perform various calculations with our powerful calculator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm mx-auto">
            {/* Display */}
            <div className="bg-slate-900 text-white p-4 rounded-lg mb-4 text-right">
              <div className="text-3xl font-mono">{display}</div>
            </div>
            
            {/* Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <Button onClick={handleClear} variant="destructive" className="h-12">
                C
              </Button>
              <Button onClick={() => {}} variant="outline" className="h-12">
                ±
              </Button>
              <Button onClick={() => {}} variant="outline" className="h-12">
                %
              </Button>
              <Button onClick={() => handleOperator('/')} variant="default" className="h-12 bg-orange-500 hover:bg-orange-600">
                ÷
              </Button>

              <Button onClick={() => handleNumber('7')} variant="outline" className="h-12">
                7
              </Button>
              <Button onClick={() => handleNumber('8')} variant="outline" className="h-12">
                8
              </Button>
              <Button onClick={() => handleNumber('9')} variant="outline" className="h-12">
                9
              </Button>
              <Button onClick={() => handleOperator('*')} variant="default" className="h-12 bg-orange-500 hover:bg-orange-600">
                ×
              </Button>

              <Button onClick={() => handleNumber('4')} variant="outline" className="h-12">
                4
              </Button>
              <Button onClick={() => handleNumber('5')} variant="outline" className="h-12">
                5
              </Button>
              <Button onClick={() => handleNumber('6')} variant="outline" className="h-12">
                6
              </Button>
              <Button onClick={() => handleOperator('-')} variant="default" className="h-12 bg-orange-500 hover:bg-orange-600">
                −
              </Button>

              <Button onClick={() => handleNumber('1')} variant="outline" className="h-12">
                1
              </Button>
              <Button onClick={() => handleNumber('2')} variant="outline" className="h-12">
                2
              </Button>
              <Button onClick={() => handleNumber('3')} variant="outline" className="h-12">
                3
              </Button>
              <Button onClick={() => handleOperator('+')} variant="default" className="h-12 bg-orange-500 hover:bg-orange-600">
                +
              </Button>

              <Button onClick={() => handleNumber('0')} variant="outline" className="h-12 col-span-2">
                0
              </Button>
              <Button onClick={handleDecimal} variant="outline" className="h-12">
                .
              </Button>
              <Button onClick={handleEquals} variant="default" className="h-12 bg-orange-500 hover:bg-orange-600">
                =
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  );
}