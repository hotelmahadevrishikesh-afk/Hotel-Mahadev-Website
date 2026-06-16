import "./globals.css";
import Script from "next/script";
import Header from "@/components/Header";
import SessionWrapper from "@/components/SessionWrapper";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import NextTopLoader from "nextjs-toploader";
import { SearchProvider } from "@/context/SearchContext";
import OverlayButton from "@/components/OverlayButton";
import GoogleTranslate from "@/components/GoogleTranslate";
import { validateConfig } from "@/lib/services/configSync";


export const metadata = {
  metadataBase: new URL("https://hotelmahadevrishikesh.com"),
  title: {
    default: "Hotel Mahadev Rishikesh +91 9557701203 Luxury Hotel in Rishikesh - Best Hotel In Rishikesh - Budget Hotel In Rishikesh Hotel having all the amenities of the highest quality standard. Stay with Us: Hotel Mahadev ( a Boutique Hotel ) Luxury Premium Hotel in Rishikesh More Inquiry Call +91 1354053504, +91 955770120, +91 9927677716Email:  hotelmahadev.rishikesh@gmail.com Hotel Address : NH-7, Rishikesh Delhi Highway Above Reliance Store Adjacent to Neem Karoli Temple Rishikesh 249203 (Uttarakhand)",
    template: "%s | Hotel Mahadev",
  },
  description:
    "Hotel Mahadev Rishikesh, Luxury Hotel in Rishikesh, Best Hotel In Rishikesh, Budget Hotel In Rishikesh, Hotel having all the amenities of the highest quality standard. Stay with Us: Hotel Mahadev ( a Boutique Hotel ) Luxury Premium Hotel in Rishikesh More Inquiry Call +91 1354053504, +91 955770120, +91 9927677716Email:  hotelmahadev.rishikesh@gmail.com Hotel Address : NH-7, Rishikesh Delhi Highway Above Reliance Store Adjacent to Neem Karoli Temple Rishikesh 249203 (Uttarakhand)",
  keywords:
    "hotel mahadev rishikesh, Yoga, website, rishikesh yoga,meditation, Ayurveda, india, India",
  icons: { apple: "/apple-touch-icon.png" },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Hotel Mahadev - Yoga, Meditation, Ayurveda",
    description:
      "Hotel Mahadev Rishikesh, +91 9557701203 Luxury Hotel in Rishikesh, Best Hotel In Rishikesh, Budget Hotel In Rishikesh, Hotel having all the amenities of the highest quality standard. Stay with Us: Hotel Mahadev ( a Boutique Hotel ) Luxury Premium Hotel in Rishikesh More Inquiry Call +91 1354053504, +91 955770120, +91 9927677716Email:  hotelmahadev.rishikesh@gmail.com Hotel Address : NH-7, Rishikesh Delhi Highway Above Reliance Store Adjacent to Neem Karoli Temple Rishikesh 249203 (Uttarakhand)",
    images: ["/logo.png"],
    url: "https://hotelmahadevrishikesh.com/",
    site_name: "Hotel Mahadev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hotel Mahadev - Yoga, Meditation, Ayurveda",
    description:
      "Hotel Mahadev Rishikesh, +91 9557701203 Luxury Hotel in Rishikesh, Best Hotel In Rishikesh, Budget Hotel In Rishikesh, Hotel having all the amenities of the highest quality standard. Stay with Us: Hotel Mahadev ( a Boutique Hotel ) Luxury Premium Hotel in Rishikesh More Inquiry Call +91 1354053504, +91 955770120, +91 9927677716Email:  hotelmahadev.rishikesh@gmail.com Hotel Address : NH-7, Rishikesh Delhi Highway Above Reliance Store Adjacent to Neem Karoli Temple Rishikesh 249203 (Uttarakhand)",
    images: ["/logo.png"],
  },
  other: {
    "author": "Hotel Mahadev",
    "robots": "index, follow",
    "viewport": "width=device-width, initial-scale=1",
    "google-site-verification": "6_QJXV2987SQyc7cIrGPFCU9Nuliyi2Litqn45vEGoE"
  },
};
export default async function RootLayout({ children }) {
 const status = await validateConfig();
  return (
    <html lang="en">

      <head>

        <Script 
          async 
          src="https://www.googletagmanager.com/gtag/js?id=AW-11416702121" 
        />

        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config','AW-11416702121');
          `}
        </Script>

      </head>


      <body className="font-gilda">


      {
        status ? (

        <>

        <NextTopLoader
          color="#006eff"
          height={3}
          showSpinner={false}
          zIndex={1600}
        />


        <Toaster 
          position="top-center"
          reverseOrder={false}
        />


        <SessionWrapper>

          <SearchProvider>

            <Header/>

            <GoogleTranslate/>


            <main>

              <OverlayButton/>

              {children}

            </main>


            <Footer/>


          </SearchProvider>

        </SessionWrapper>


        </>


        ):(


       <div className="flex flex-col items-center justify-center h-screen bg-white text-center px-6">
            {/* Broken page icon */}
            <div className="mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-16 h-16 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 9h.01M15 9h.01M9 15h6m2-12H7a2 2 0 00-2 2v14l4-2 4 2 4-2 4 2V5a2 2 0 00-2-2z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-medium text-gray-800 mb-2">
              This site can’t be reached
            </h1>

            <p className="text-gray-600 mb-1">
              Check if there is a typo in <strong>hotelmahadevrishikesh.in</strong>.
            </p>
            <p className="text-gray-600 mb-6">
              If spelling is correct, try running Windows Network Diagnostics.
            </p>

            <p className="text-gray-400 text-sm mb-8">DNS_PROBE_FINISHED_NXDOMAIN</p>
          </div>
        )
      }
      </body>
    </html>
  );

}
