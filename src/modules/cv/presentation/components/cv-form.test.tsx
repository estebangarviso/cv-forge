import { type CvData, EMPTY_CV } from '@modules/cv';
import {
	fireEvent,
	render,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { CvForm } from './cv-form';

vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

const loadedCv: CvData = {
	...EMPTY_CV,
	aboutMe: 'Loaded biography',
	address: 'Loaded address',
	email: 'loaded@example.com',
	name: 'Loaded name',
	phone: '+56 977 987 590',
	title: 'Loaded profession',
};

function DelayedCvForm() {
	const form = useForm<CvData>({ defaultValues: EMPTY_CV });
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		if (loaded) form.reset(loadedCv);
	}, [form, loaded]);

	return (
		<>
			<button onClick={() => setLoaded(true)} type='button'>
				Load CV
			</button>
			<CvForm form={form} onSubmit={vi.fn()} />
		</>
	);
}

describe('CvForm', () => {
	it('shows asynchronously loaded personal fields without toggling sections', async () => {
		render(<DelayedCvForm />);
		fireEvent.click(screen.getByRole('button', { name: 'Load CV' }));

		await waitFor(() => {
			expect(screen.getByLabelText('name')).toHaveValue('Loaded name');
			expect(screen.getByLabelText('title')).toHaveValue(
				'Loaded profession',
			);
			expect(screen.getByLabelText('email')).toHaveValue(
				'loaded@example.com',
			);
			expect(screen.getByLabelText('phone')).toHaveValue(
				'+56 977 987 590',
			);
			expect(screen.getByLabelText('address')).toHaveValue(
				'Loaded address',
			);
			expect(
				within(
					screen.getByRole('region', { name: 'aboutMe' }),
				).getByRole('textbox'),
			).toHaveValue('Loaded biography');
		});
	});
});
