export interface ESignRequest {
	contractId: string;
	fileUrl: string;
	recipients: Array<{ email: string; name?: string; role?: string }>;
	metadata?: Record<string, any>;
}

export interface ESignResult {
	requestId: string;
	status: 'created' | 'sent' | 'completed' | 'cancelled' | 'failed';
	provider?: string;
	redirectUrl?: string;
	meta?: Record<string, any>;
}

export interface ESignAdapter {
	name: string;
	createRequest(input: ESignRequest): Promise<ESignResult>;
	getStatus(requestId: string): Promise<ESignResult>;
	cancel(requestId: string): Promise<void>;
}