export default function PiggyDetailPage({ params }: { params: { id: string } }) {
    return (
        <main>
            <h1>Piggy Detail</h1>
            <p>Detail for piggy id: {params.id}</p>
        </main>
    );
}
