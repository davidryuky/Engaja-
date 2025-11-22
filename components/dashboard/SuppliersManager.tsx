
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, PlusCircle, AlertTriangle, Trash2, Star } from 'lucide-react';
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
            // Silent fail in some cases or show error
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
            
            // Otimistic Update or Refetch
            setSuppliers(prev => [...prev, data.supplier].sort((a, b) => Number(b.is_favorited) - Number(a.is_favorited)));
        } catch (err: any) {
            throw err; // To be handled by modal
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
        if (window.confirm('Tem certeza que deseja apagar este fornecedor?')) {
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
        <div className="bg-brand-dark-200 border border-brand-purple/30 rounded-lg p-4 md:p-6 mb-8 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    Fornecedores
                    <span className="text-sm font-normal text-slate-400 bg-brand-dark px-2 py-1 rounded-full border border-brand-purple/20">
                        {suppliers.length}
                    </span>
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-brand-purple hover:bg-opacity-80 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-brand-purple/20"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Adicionar</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
                </div>
            ) : suppliers.length === 0 ? (
                <div className="text-center border-2 border-dashed border-brand-purple/20 rounded-lg p-8">
                    <p className="text-slate-400">Nenhum fornecedor cadastrado.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {suppliers.map(supplier => (
                        <div
                            key={supplier.id}
                            className={`relative flex items-center gap-2 p-2 rounded-lg transition-colors duration-300 border border-brand-purple/30 group ${supplier.is_favorited ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-brand-dark hover:bg-brand-dark/80'}`}
                        >
                            <button
                                onClick={() => handleToggleFavorite(supplier.id, !supplier.is_favorited)}
                                className="p-1 rounded-full hover:bg-slate-500/20 flex-shrink-0 transition-transform hover:scale-110"
                                title={supplier.is_favorited ? 'Desfavoritar' : 'Favoritar'}
                            >
                                <Star className={`w-4 h-4 transition-colors ${supplier.is_favorited ? 'text-yellow-400 fill-current' : 'text-slate-500 group-hover:text-slate-300'}`} />
                            </button>
                            <a
                                href={supplier.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-grow text-sm text-center text-slate-200 font-medium hover:text-brand-pink truncate"
                                title={supplier.name}
                            >
                                {supplier.name}
                            </a>
                            <button
                                onClick={() => handleDeleteSupplier(supplier.id)}
                                className="p-1 rounded-full text-slate-600 hover:text-red-400 hover:bg-red-500/10 flex-shrink-0 transition-colors"
                                title="Apagar Fornecedor"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
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
