// Force dynamic rendering - this page fetches from a backend API
export const dynamic = 'force-dynamic';

async function Page() {
    const response = await fetch('http://localhost:3000/api/books');
    const books = await response.json();

    return (
        <main>
            <code>{JSON.stringify(books, null, 2)}</code>
        </main>
    );
}
export default Page;