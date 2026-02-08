import { supabase } from './supabaseClient';
import { Profile, Transaction, Goal } from '../types';

// Helper to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(toCamelCase);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[camelKey] = toCamelCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

// Helper to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(toSnakeCase);
    }
    if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((acc, key) => {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            acc[snakeKey] = toSnakeCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};

export const SupabaseService = {
    // ==================== PROFILES ====================

    getProfiles: async (): Promise<Profile[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching profiles:', error);
            throw error;
        }

        return toCamelCase(data || []);
    },

    createProfile: async (profile: Omit<Profile, 'id'>): Promise<Profile> => {
        const profileData = toSnakeCase(profile);

        const { data, error } = await supabase
            .from('profiles')
            .insert([profileData])
            .select()
            .single();

        if (error) {
            console.error('Error creating profile:', error);
            throw error;
        }

        return toCamelCase(data);
    },

    deleteProfile: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting profile:', error);
            throw error;
        }
    },

    // ==================== TRANSACTIONS ====================

    getTransactions: async (): Promise<Transaction[]> => {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }

        return toCamelCase(data || []);
    },

    createTransaction: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
        const transactionData = toSnakeCase(transaction);

        const { data, error } = await supabase
            .from('transactions')
            .insert([transactionData])
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            throw error;
        }

        return toCamelCase(data);
    },

    deleteTransaction: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    },

    // ==================== GOALS ====================

    getGoals: async (): Promise<Goal[]> => {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) {
            console.error('Error fetching goals:', error);
            throw error;
        }

        return toCamelCase(data || []);
    },

    createGoal: async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
        const goalData = toSnakeCase(goal);

        const { data, error } = await supabase
            .from('goals')
            .insert([goalData])
            .select()
            .single();

        if (error) {
            console.error('Error creating goal:', error);
            throw error;
        }

        return toCamelCase(data);
    },

    updateGoal: async (id: string, updates: Partial<Goal>): Promise<Goal> => {
        const goalData = toSnakeCase(updates);

        const { data, error } = await supabase
            .from('goals')
            .update(goalData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating goal:', error);
            throw error;
        }

        return toCamelCase(data);
    },

    deleteGoal: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting goal:', error);
            throw error;
        }
    },

    // ==================== MIGRATION ====================

    migrateFromLocalStorage: async (): Promise<void> => {
        const KEYS = {
            PROFILES: 'fincontrol_profiles',
            TRANSACTIONS: 'fincontrol_transactions',
            GOALS: 'fincontrol_goals'
        };

        try {
            // Check if migration already happened
            const { data: existingProfiles } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);

            if (existingProfiles && existingProfiles.length > 0) {
                console.log('Migration already completed, skipping...');
                return;
            }

            // Migrate Profiles
            const profilesData = localStorage.getItem(KEYS.PROFILES);
            if (profilesData) {
                const profiles = JSON.parse(profilesData);
                for (const profile of profiles) {
                    const { id, ...profileWithoutId } = profile;
                    const profileData = toSnakeCase(profileWithoutId);

                    // Insert with specific ID to maintain relationships
                    await supabase
                        .from('profiles')
                        .insert([{ id, ...profileData }]);
                }
                console.log(`Migrated ${profiles.length} profiles`);
            }

            // Migrate Transactions
            const transactionsData = localStorage.getItem(KEYS.TRANSACTIONS);
            if (transactionsData) {
                const transactions = JSON.parse(transactionsData);
                for (const transaction of transactions) {
                    const { id, ...transactionWithoutId } = transaction;
                    const transactionData = toSnakeCase(transactionWithoutId);

                    await supabase
                        .from('transactions')
                        .insert([{ id, ...transactionData }]);
                }
                console.log(`Migrated ${transactions.length} transactions`);
            }

            // Migrate Goals
            const goalsData = localStorage.getItem(KEYS.GOALS);
            if (goalsData) {
                const goals = JSON.parse(goalsData);
                for (const goal of goals) {
                    const { id, ...goalWithoutId } = goal;
                    const goalData = toSnakeCase(goalWithoutId);

                    await supabase
                        .from('goals')
                        .insert([{ id, ...goalData }]);
                }
                console.log(`Migrated ${goals.length} goals`);
            }

            console.log('Migration completed successfully!');
        } catch (error) {
            console.error('Migration error:', error);
            throw error;
        }
    }
};
