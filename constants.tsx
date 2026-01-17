
import React from 'react';
import { Transaction, ExpenseCategory } from './types';

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const EXPENSE_CATEGORIES: { label: ExpenseCategory, icon: string, color: string }[] = [
  { label: 'Combustível', icon: 'local_gas_station', color: 'text-orange-500' },
  { label: 'Alimentação', icon: 'restaurant', color: 'text-yellow-500' },
  { label: 'Manutenção', icon: 'settings', color: 'text-blue-500' },
  { label: 'Lavação', icon: 'local_car_wash', color: 'text-cyan-500' },
  { label: 'Taxas App', icon: 'receipt_long', color: 'text-purple-500' },
  { label: 'Outros', icon: 'more_horiz', color: 'text-gray-400' },
];
