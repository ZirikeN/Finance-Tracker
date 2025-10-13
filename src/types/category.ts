export interface Category {
    id?: string
    name: string
    color: string
    icon: string
    type: 'income' | 'expense'
    isDefault: boolean
    userId?: string 
    createdAt?: Date
}

export interface UserCategories {
    income: Category[]
    expense: Category[]
}
