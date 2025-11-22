
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, PlusCircle, AlertTriangle, Trash2, Star, ExternalLink } from 'lucide-react';
import { Supplier } from './DashboardTypes';
import { AddSupplierModal } from '../AddSupplierModal';

export const SuppliersManager: React.FC = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchSuppliers = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/suppliers');
            if (!response.ok) throw new Error('Falha ao buscar fornecedores.');
            const data = await response.json();
            if (data.success) {
                setSuppliers(data.suppliers);
            } else {
                throw new Error(data.message);
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const handleAddSupplier = async (name: string, link: string) => {
        try {
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, link }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
            
            setSuppliers(prev => [...prev, data.supplier].sort((a, b) => Number(b.is_favorited) - Number(a.is_favorited)));
        } catch (err: any) {
            throw err;
        }
    };

    const handleToggleFavorite = async (id: number, isFavorited: boolean) => {
        const originalSuppliers = [...suppliers];
        const updatedSuppliers = suppliers.map(s => s.id === id ? { ...s, is_favorited: isFavorited } : s)
            .sort((a, b) => Number(b.is_favorited) - Number(a.is_favorited));
        setSuppliers(updatedSuppliers);

        try {
            const response = await fetch('/api/suppliers', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, is_favorited: isFavorited }),
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message);
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            setSuppliers(originalSuppliers); // Revert
        }
    };

    const handleDeleteSupplier = async (id: number) => {
        if (window.confirm('Apagar fornecedor?')) {
            const originalSuppliers = [...suppliers];
            setSuppliers(suppliers.filter(s => s.id !== id));
            try {
                const response = await fetch('/api/suppliers', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id }),
                });
                const data = await response.json();
                if (!data.success) throw new Error(data.message);
            } catch (err) {
                console.error('Failed to delete supplier:', err);
                setSuppliers(originalSuppliers); // Revert
            }
        }
    };

    return (
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg p-3 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Fornecedores</h2>
                    <span className="text-[10px] font-mono text-slate-400 bg-brand-dark px-1.5 py-0.5 rounded border border-brand-purple/20">
                        {suppliers.length}
                    </span>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-xs flex items-center gap-1 text-brand-pink hover:text-white transition-colors"
                >
                    <PlusCircle className="w-3 h-3" />
                    Adicionar
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-2 rounded mb-2 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-pink" />
                </div>
            ) : suppliers.length === 0 ? (
                <div className="text-center py-4 text-xs text-slate-500">
                    <p>Nenhum fornecedor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
                    {suppliers.map(supplier => (
                        <div
                            key={supplier.id}
                            className={`group relative flex items-center justify-between p-2.5 rounded-md transition-all duration-200 border ${supplier.is_favorited ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-brand-dark border-brand-purple/10 hover:border-brand-purple/40'}`}
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <button
                                    onClick={() => handleToggleFavorite(supplier.id, !supplier.is_favorited)}
                                    className="focus:outline-none flex-shrink-0"
                                    title={supplier.is_favorited ? 'Desfavoritar' : 'Favoritar'}
                                >
                                    <Star className={`w-3.5 h-3.5 ${supplier.is_favorited ? 'text-yellow-400 fill-current' : 'text-slate-600 hover:text-slate-400'}`} />
                                </button>
                                <a
                                    href={supplier.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-slate-300 hover:text-brand-pink truncate font-medium"
                                    title={supplier.name}
                                >
                                    {supplier.name}
                                </a>
                            </div>
                            
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <a
                                    href={supplier.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-500 hover:text-brand-pink"
                                    title="Abrir Link"
                                >
                                   <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                    onClick={() => handleDeleteSupplier(supplier.id)}
                                    className="text-slate-600 hover:text-red-400"
                                    title="Remover"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <AddSupplierModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAddSupplier={handleAddSupplier} 
            />
        </div>
    );
};
