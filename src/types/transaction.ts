export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: Date;
    description: string;
    color?: string;
    userId: string;
}

export interface TransactionForm {
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: string; // для input type="date"
    description: string;
}

// Тип для обновления транзакции (все поля опциональны, кроме id)
export type TransactionUpdate = Partial<Omit<Transaction, 'id'>> & {
    id: string;
}

// Тип для создания новой транзакции (без id и userId)
export type TransactionCreate = Omit<Transaction, 'id' | 'userId'>;

// Тип для Firestore (с Timestamp вместо Date)
export interface TransactionFirestore {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    date: any; // Timestamp или Date
    description: string;
    color?: string;
    userId: string;
}