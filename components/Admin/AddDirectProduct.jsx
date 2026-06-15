"use client"
import React, { useState, useEffect } from 'react';
import ProductGallery from './ProductGallery';
import ProductInfo from './ProductInfo';
import CategoryTag from './CategoryTag';
import ProductReview from './ProductReview';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import VideoManagement from './VideoManagement';
import ProductDescription from './ProductDescription';
import ApplyTax from './ApplyTax';
import { ArrowLeftIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PackagePdf from "./PackagePdf"
import PackagePrice from './PackagePrice';
import PackageHighlights from './PackageHighlights';
const AddDirectProduct = ({ productId }) => {
  // console.log(productId)
  const router = useRouter();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(false);
  // console.log(productData)
  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetch(`/api/packages/${productId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
        .then(res => res.json())
        .then(data => {
          setProductData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [productId]);

  const sectionConfig = [
    { key: 'price', label: 'Price Management', component: (props) => <PackagePrice {...props} productData={productData} packageId={productId} /> },
    { key: 'gallery', label: 'Package Gallery', component: (props) => <ProductGallery {...props} productData={productData} productId={productId} /> },
    { key: 'video', label: 'Video Management', component: (props) => <VideoManagement {...props} productData={productData} packageId={productId} /> },
    { key: 'description', label: 'Package Description', component: (props) => <ProductDescription {...props} productData={productData} packageId={productId} /> },
    { key: 'info', label: 'Package Information', component: (props) => <ProductInfo {...props} productData={productData} packageId={productId} /> },
    { key: 'review', label: 'Create Review', component: (props) => <ProductReview {...props} productData={productData} packageId={productId} /> },
    { key: 'pdf', label: 'Upload Package PDF', component: (props) => <PackagePdf {...props} productData={productData} packageId={productId} /> },
    { key: 'highlights', label: 'Package Highlights', component: (props) => <PackageHighlights {...props} productData={productData} packageId={productId} /> },
  ];
  const [activeSection, setActiveSection] = useState(sectionConfig[0].key);


  return (
    <div style={{ minHeight: '85vh', background: '#fff', padding: '20px' }}>
      {loading ? (
        <div className="text-center text-lg font-semibold flex items-center justify-center"><Loader2 className='animate-spin mx-2'/><span>Loading packages...</span></div>
      ) : (
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full h-full">
          <div className="back mb-2">
            <button className='px-4 py-1 bg-gray-500 text-white rounded flex items-center' onClick={() => router.back()}>
              <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to View Packages
            </button>
          </div>
          <div className="flex h-full">
            {/* Sidebar Tabs */}
            <TabsList className="flex flex-col gap-2 min-w-[220px] w-[220px] bg-gray-300 border-r border-gray-200 py-4 px-2 rounded-l-lg shadow-sm h-fit">
              {sectionConfig.map(section => (
                <TabsTrigger
                  key={section.key}
                  value={section.key}
                  className={
                    `text-base px-6 py-3 text-left rounded-lg transition-all font-medium
                    data-[state=active]:bg-blue-600 data-[state=active]:text-white
                    data-[state=inactive]:bg-blue-100 data-[state=inactive]:text-gray-900
                    hover:bg-blue-400 focus:outline-none w-full`
                  }
                  style={{ justifyContent: 'flex-start' }}
                >
                  {section.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {/* Section Content */}
            <div className="flex-1 p-4 rounded-r-lg shadow-sm min-h-[400px]">
              {sectionConfig.map(section => (
                <TabsContent key={section.key} value={section.key} className="h-full">
                  {section.component({ productData })}
                </TabsContent>
              ))}
            </div>
          </div>
        </Tabs>
      )}
    </div>
  );
};

export default AddDirectProduct;