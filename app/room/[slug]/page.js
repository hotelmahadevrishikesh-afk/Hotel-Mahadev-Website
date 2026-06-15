import RoomDetails from "@/components/RoomDetails";

export default async function RoomPage({ params }) {
    const { slug } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/room/by_name/${encodeURIComponent(slug)}`);
    const room = await res.json();
    if (!room || room.error) return <div>Page Not found</div>;
    return <RoomDetails data={room} />;
}