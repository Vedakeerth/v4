// Route: /quote/[id]
import QuoteDetailPageClient from './QuoteDetailPageClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function QuoteDetailPage({ params }: PageProps) {
    const { id } = await params;

    return <QuoteDetailPageClient id={id} />;
}
