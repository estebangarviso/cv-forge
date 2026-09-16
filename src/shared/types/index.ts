/**
 * Shared type definitions used across modules.
 */

/** Standard paginated API response */
export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
}

/** Standard API error response */
export interface ApiError {
	detail?: string;
	errors?: Record<string, string[]>;
	status: number;
	title: string;
}

/** UUID brand type */
export type UUID = string & { readonly __brand: 'UUID' };
