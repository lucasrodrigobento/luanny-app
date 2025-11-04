import React, { useState } from 'react';
import { useConfigManager } from '../../hooks/useConfigManager';
import { Empresa } from '../../types';
import { OfficeBuildingIcon } from '../icons/OfficeBuildingIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { TrashIcon } from '../icons/TrashIcon';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { UploadIcon } from '../icons/UploadIcon';
import { fileToBase64 } from '../../utils/fileUtils';
import { Notification } from '../Notification';

interface ConfiguracoesProps {
    configManager: ReturnType<typeof useConfigManager>;
}

export const Configuracoes: React.FC<ConfiguracoesProps> = ({ configManager }) => {
    const { empresas, addEmpresa, updateEmpresa, deleteEmpresa, loading, error } = configManager;
    const [editingEmpresa, setEditingEmpresa] = useState<Partial<Empresa> & { id?: string }>({});
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await fileToBase64(file);
                setEditingEmpresa(prev => ({ ...prev, certificadoBase64: base64, nomeCertificado: file.name }));
            } catch (err) {
                console.error("Error converting file to base64", err);
                showNotification("Error processing certificate file.", 'error');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { id, ...data } = editingEmpresa;
        if (!data.nome || !data.cnpj || !data.estado || !data.senhaCertificado) {
            showNotification("Please fill all required fields, including password.", 'error');
            return;
        }

        try {
            if (id) {
                await updateEmpresa(id, data as Omit<Empresa, 'id'>);
                showNotification("Company updated successfully!", 'success');
            } else {
                await addEmpresa(data as Omit<Empresa, 'id'>);
                showNotification("Company added successfully!", 'success');
            }
            setIsFormVisible(false);
            setEditingEmpresa({});
        } catch (err: any) {
            showNotification(err.message || "An error occurred.", 'error');
        }
    };

    const handleEdit = (empresa: Empresa) => {
        setEditingEmpresa(empresa);
        setIsFormVisible(true);
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this company?")) {
            try {
                await deleteEmpresa(id);
                showNotification("Company deleted successfully.", 'success');
            } catch (err: any) {
                 showNotification(err.message || "Failed to delete company.", 'error');
            }
        }
    };
    
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    const startNewForm = () => {
        setEditingEmpresa({ tpAmb: '2' }); // Default to Homologação
        setIsFormVisible(true);
    };

    const InputField: React.FC<{ label: string, name: keyof Omit<Empresa, 'id'>, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void, type?: string, required?: boolean }> = 
        ({ label, name, value, onChange, type = 'text', required = false }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                value={value || ''}
                onChange={onChange}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
        </div>
    );
    
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-100">Company Settings</h2>
                <button onClick={startNewForm} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors">
                    Add New Company
                </button>
            </div>

            {isFormVisible && (
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4">{editingEmpresa.id ? 'Edit Company' : 'Add New Company'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Company Name" name="nome" value={editingEmpresa.nome} onChange={e => setEditingEmpresa(p => ({ ...p, nome: e.target.value }))} required />
                        <InputField label="CNPJ" name="cnpj" value={editingEmpresa.cnpj} onChange={e => setEditingEmpresa(p => ({ ...p, cnpj: e.target.value }))} required />
                        <InputField label="State (e.g., DF)" name="estado" value={editingEmpresa.estado} onChange={e => setEditingEmpresa(p => ({ ...p, estado: e.target.value }))} required />
                        <InputField label="Certificate Password" name="senhaCertificado" value={editingEmpresa.senhaCertificado} onChange={e => setEditingEmpresa(p => ({...p, senhaCertificado: e.target.value}))} type="password" required />
                        
                        <div className="md:col-span-2">
                            <label htmlFor="tpAmb" className="block text-sm font-medium text-gray-300 mb-1">Environment</label>
                            <select
                                id="tpAmb"
                                name="tpAmb"
                                value={editingEmpresa.tpAmb || '2'}
                                onChange={e => setEditingEmpresa(p => ({...p, tpAmb: e.target.value as '1' | '2'}))}
                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="1">Production</option>
                                <option value="2">Test/Sandbox</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-300 mb-1">A1 Certificate (.pfx, .p12)</label>
                             <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                                    <div className="flex text-sm text-gray-400">
                                        <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-indigo-500">
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pfx,.p12" />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">{editingEmpresa.nomeCertificado || 'PFX, P12 up to 10MB'}</p>
                                </div>
                             </div>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => setIsFormVisible(false)} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500">Cancel</button>
                            <button type="submit" className="px-4 py-2 w-32 flex justify-center items-center bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                                {loading ? <SpinnerIcon /> : <SaveIcon className="w-5 h-5" />}
                                <span className="ml-2">{editingEmpresa.id ? 'Update' : 'Save'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <ul className="divide-y divide-gray-700">
                    {loading && !empresas.length && <li className="p-4 text-center text-gray-400">Loading...</li>}
                    {error && <li className="p-4 text-center text-red-400">{error}</li>}
                    {!loading && !empresas.length && <li className="p-4 text-center text-gray-400">No companies configured.</li>}
                    {empresas.map(empresa => (
                        <li key={empresa.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-gray-700/50">
                            <div className="flex items-center gap-4">
                                <OfficeBuildingIcon className="w-8 h-8 text-sky-400" />
                                <div>
                                    <p className="font-bold text-lg text-white">{empresa.nome}</p>
                                    <p className="text-sm text-gray-400">{empresa.cnpj} - {empresa.estado} - {empresa.tpAmb === '1' ? 'Production' : 'Test'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3 sm:mt-0">
                                <button onClick={() => handleEdit(empresa)} className="p-2 text-gray-300 hover:text-white hover:bg-gray-600 rounded-md">Edit</button>
                                <button onClick={() => handleDelete(empresa.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/50 rounded-md"><TrashIcon className="w-5 h-5" /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
             {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
        </div>
    );
};