import ArtisanDetails from '@/components/ArtisanDetails';
import Link from 'next/link';
// Next.js 13+ server component: fetch artisan by id from API
export default async function Page({ params }) {
  const { slug } = await params;
  // console.log(slug)
  // Adjust the API endpoint as per your backend route
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/createArtisan/byName/${encodeURIComponent(slug)}`, {
    cache: 'no-store' // Uncomment if you want fresh data every time
  });
  if (!res.ok) {
    // You can show a 404 or error message here
    return <div className="text-center py-20 text-2xl text-red-500">
        Artisan not found.
        <br />
        <br />
        <Link href='/' className="bg-green-500 text-white px-4 py-2 rounded-md my-2">Back to Home</Link>
    </div>;
  }
  const artisan = await res.json();
  // console.log(artisan)
  return <ArtisanDetails artisan={artisan} />;
}
