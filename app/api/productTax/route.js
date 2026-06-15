import ProductTax from '@/models/ProductTax';
import Packages from '@/models/Packages';
import connectDB from '@/lib/connectDB';

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const packages = searchParams.get('packages');
  try {
    if (packages) {
      const data = await ProductTax.findOne({ packages }).populate('packages', 'title');
      return Response.json({ data });
    } else {
      const data = await ProductTax.find({}).populate('packages', 'title');
      return Response.json({ data });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connectDB();
  try { 
    const { packages, cgst, sgst } = await req.json();
    if (!packages) return Response.json({ error: 'Packages is required' }, { status: 400 });
    let doc = await ProductTax.findOne({ packages });
    if (doc) {
      return Response.json({ error: 'Tax already exists for this packages' }, { status: 400 });
    } else {
      doc = await ProductTax.create({ packages, cgst, sgst });
      // Also update the Packages model to link the tax
      await Packages.findByIdAndUpdate(packages, { taxes: doc._id });
    }
    return Response.json({ data: doc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  await connectDB();
  try {
    const { packages, cgst, sgst } = await req.json();
    if (!packages) return Response.json({ error: 'Packages is required' }, { status: 400 });
    const doc = await ProductTax.findOneAndUpdate(
      { packages },
      { cgst, sgst },
      { new: true }
    );
    // Also update the Packages model to link the tax
    await Packages.findByIdAndUpdate(packages, { taxes: doc._id });
    return Response.json({ data: doc });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connectDB();
  try {
    const { packages, tax } = await req.json();
    if (!packages) return Response.json({ error: 'Packages is required' }, { status: 400 });
    if (tax === '__all__') {
      // Remove all taxes for packages
      await ProductTax.deleteOne({ packages });
      // Also update the Packages model to remove the tax reference
      await Packages.findByIdAndUpdate(packages, { taxes: null });
      return Response.json({ success: true });
    } else {
      // Remove a single tax from the array
      // Remove the ProductTax document for this packages
      const doc = await ProductTax.findOneAndDelete({ _id: tax, packages });
      // Also update the Packages model to remove the tax
      const prod = await Packages.findById(packages);
      if (prod && prod.taxes && prod.taxes.toString() === tax) {
        await Packages.findByIdAndUpdate(packages, { taxes: null });
      }
      return Response.json({ data: doc });
    }
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
