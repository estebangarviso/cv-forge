'use client';

import {
	Avatar,
	AvatarFallback,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	Separator,
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from '@/shared/ui';
import { LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

import { LocaleSwitcher } from '../../(front-office)/locale-switcher';
import { APP_NAV_ITEMS } from './app-nav';

function getInitials(name: string | null | undefined): string {
	if (!name) return '?';
	return name
		.split(' ')
		.map((w) => w[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

export function AppShell({ children }: { children: React.ReactNode }) {
	const t = useTranslations();
	const pathname = usePathname();
	const { data: session } = useSession();

	return (
		<SidebarProvider>
			<Sidebar collapsible='icon'>
				<SidebarHeader>
					<SidebarMenuButton
						asChild
						className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
						size='lg'
					>
						<a href='/'>
							<Image
								alt=''
								className='size-8'
								height={32}
								src='/logo.svg'
								width={32}
							/>
							<span className='truncate text-sm font-semibold'>
								{t('shell.brand')}
							</span>
						</a>
					</SidebarMenuButton>
				</SidebarHeader>

				<SidebarContent>
					<SidebarGroup>
						<SidebarMenu>
							{APP_NAV_ITEMS.map((item) => (
								<SidebarMenuItem key={item.href}>
									<SidebarMenuButton
										asChild
										isActive={pathname.endsWith(item.href)}
										tooltip={t(item.labelKey)}
									>
										<a href={item.href}>
											<item.icon className='size-4' />
											<span>{t(item.labelKey)}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
			</Sidebar>

			<SidebarInset className='@container/content has-data-[layout=fixed]:h-svh peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'>
				<header className='z-50 h-16 shadow-none'>
					<div className='relative flex h-full items-center justify-between gap-3 p-4 sm:gap-4'>
						<SidebarTrigger
							aria-label='Toggle sidebar'
							className='-ml-1'
						/>
						<Separator
							className='mr-2 h-4'
							orientation='vertical'
						/>
						<div className='flex items-center gap-1'>
							<LocaleSwitcher />
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button
										aria-label={t('shell.userMenu')}
										className='flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring'
										type='button'
									>
										<Avatar className='size-7'>
											<AvatarFallback className='text-xs'>
												{getInitials(
													session?.user?.name,
												)}
											</AvatarFallback>
										</Avatar>
										<span className='hidden max-w-32 truncate sm:inline'>
											{session?.user?.name ?? ''}
										</span>
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align='end'
									className='w-56'
								>
									<DropdownMenuLabel>
										{t('shell.userMenu')}
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem onClick={() => signOut()}>
										<LogOut className='mr-2 size-4' />
										{t('shell.signOut')}
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</header>
				{/* bounded, non-scrolling: pages own their internal scroll regions */}
				<main
					className='min-h-0 flex-1 overflow-hidden p-6'
					data-layout='fixed'
				>
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
