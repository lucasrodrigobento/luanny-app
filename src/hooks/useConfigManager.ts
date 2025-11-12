import { useState, useEffect, useCallback } from 'react';
import { Empresa } from '../types';

const STORAGE_KEY = 'uau-arquivei-sync-empresas';

export const useConfigManager = () => {
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            setLoading(true);
            const storedEmpresas = localStorage.getItem(STORAGE_KEY);
            if (storedEmpresas) {
                setEmpresas(JSON.parse(storedEmpresas));
            }
        } catch (err) {
            console.error('Failed to load companies from local storage', err);
            setError('Could not load company configurations.');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveEmpresas = useCallback((updatedEmpresas: Empresa[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmpresas));
            setEmpresas(updatedEmpresas);
        } catch (err) {
            console.error('Failed to save companies to local storage', err);
            const saveError = new Error('Could not save company configurations.');
            setError(saveError.message);
            throw saveError;
        }
    }, []);

    const addEmpresa = useCallback(
        async (newEmpresaData: Omit<Empresa, 'id'>) => {
            setLoading(true);
            try {
                await new Promise((res) => setTimeout(res, 500)); // Simula async
                const newEmpresa: Empresa = {
                    ...newEmpresaData,
                    id: new Date().toISOString() + Math.random(), // ID simples
                };
                const updatedEmpresas = [...empresas, newEmpresa];
                saveEmpresas(updatedEmpresas);
            } finally {
                setLoading(false);
            }
        },
        [empresas, saveEmpresas]
    );

    const updateEmpresa = useCallback(
        async (id: string, updatedData: Partial<Omit<Empresa, 'id'>>) => {
            setLoading(true);
            try {
                await new Promise((res) => setTimeout(res, 500)); // Simula async
                const updatedEmpresas = empresas.map((emp) => (emp.id === id ? { ...emp, ...updatedData } : emp));
                saveEmpresas(updatedEmpresas);
            } finally {
                setLoading(false);
            }
        },
        [empresas, saveEmpresas]
    );

    const deleteEmpresa = useCallback(
        async (id: string) => {
            setLoading(true);
            try {
                await new Promise((res) => setTimeout(res, 500)); // Simula async
                const updatedEmpresas = empresas.filter((emp) => emp.id !== id);
                saveEmpresas(updatedEmpresas);
            } finally {
                setLoading(false);
            }
        },
        [empresas, saveEmpresas]
    );

    return { empresas, addEmpresa, updateEmpresa, deleteEmpresa, loading, error };
};
