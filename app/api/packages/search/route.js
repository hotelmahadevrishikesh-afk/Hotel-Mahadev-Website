import connectDB from '@/lib/connectDB';
import Packages from '@/models/Packages';
import MenuBar from '@/models/MenuBar';
import mongoose from "mongoose";

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category');

  let filter = {};
  if (q) {
    filter.title = { $regex: q, $options: 'i' };
  }

  let packageIds = null;
  if (category && category !== 'all') {
    // Find the subMenu by _id
    const menu = await MenuBar.findOne({ "subMenu._id": category }, { "subMenu.$": 1 });
    let subMenu = null;
    let packageIds = [];
    if (menu && menu.subMenu && menu.subMenu.length > 0) {
      subMenu = menu.subMenu[0];
      // Try both possible fields for package references
      packageIds = subMenu.rooms || subMenu.products || [];
      // console.log('category:', category, 'menu:', !!menu, 'subMenu:', !!subMenu, 'packageIds:', packageIds);
      if (!Array.isArray(packageIds) || packageIds.length === 0) {
        return Response.json({ packages: [] });
      }
      filter._id = { $in: packageIds };
    } else {
      // No such category, return empty
      // console.log('No subMenu found for category:', category);
      return Response.json({ packages: [] });
    }
  }

  try {
    const packages = await Packages.find(filter)
      .select('title gallery slug')
      .populate({ path: 'gallery', select: 'mainImage' })
      .limit(20);

    const mapped = packages.map(prod => {
  // Get image URL (handle nested structure and fallback)
  let imageUrl = prod.gallery?.mainImage?.url || prod.gallery?.mainImage?.url || "/placeholder.jpeg";

  return {
    _id: prod._id,
    title: prod.title,
    slug: prod.slug,
    image: imageUrl,
  };
});

    return Response.json({ packages: mapped });
  } catch (error) {
    return Response.json({ packages: [], error: error.message }, { status: 500 });
  }
}