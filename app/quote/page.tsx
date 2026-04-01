import { redirect } from 'next/navigation';
import { generateRandomId } from '@/lib/seo-utils';

export default async function QuotePage() {
    const randomId = generateRandomId(8);
    redirect(`/quote/${randomId}`);
}
