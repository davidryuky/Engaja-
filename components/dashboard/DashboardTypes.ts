
export interface Order {
    id: number;
    public_id: string;
    platform: string;
    service: string;
    link: string;
    quantity: number | null;
    comments: string | null;
    payment_status: 'Aguardando Pagamento' | 'Pago';
    progress_status: 'Parado' | 'Iniciado';
    completion_status: 'Incompleto' | 'Concluido';
    problem_status: 'Normal' | 'Problema';
    notes: string | null;
    created_at: string;
}

export interface Supplier {
    id: number;
    name: string;
    link: string;
    is_favorited: number | boolean;
}

export type StatusType = 'payment_status' | 'progress_status' | 'completion_status' | 'problem_status';
