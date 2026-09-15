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
	SidebarFooter,
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

				<SidebarFooter className='p-2'>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton className='w-full'>
								<Avatar className='size-6'>
									<AvatarFallback className='text-xs'>
										{getInitials(session?.user?.name)}
									</AvatarFallback>
								</Avatar>
								<span className='truncate'>
									{session?.user?.name ?? ''}
								</span>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align='start'
							className='w-56'
							side='top'
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
				</SidebarFooter>
			</Sidebar>

			<SidebarInset className='@container/content has-data-[layout=fixed]:h-svh peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]'>
				<header className='z-50 h-16 shadow-none'>
					<div className='relative flex h-full items-center gap-3 p-4 sm:gap-4'>
						<SidebarTrigger
							aria-label='Toggle sidebar'
							className='-ml-1'
						/>
						<Separator
							className='mr-2 h-4'
							orientation='vertical'
						/>
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
