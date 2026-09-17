export type { Session } from './domain/entities/session';
export type { User } from './domain/entities/user';
export {
	isEmailAllowed,
	parseAllowedEmails,
} from './domain/use-cases/is-email-allowed.use-case';
export { AuthGuard } from './presentation/components/auth-guard';
