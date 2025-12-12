import type { Metadata } from 'next';
import '@coinbase/onchainkit/styles.css';
import './globals.css';
import { Providers } from './providers';
import FarcasterWrapper from "@/components/FarcasterWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
        <html lang="en">
          <body>
            <Providers>
      <FarcasterWrapper>
        {children}
      </FarcasterWrapper>
      </Providers>
          </body>
        </html>
      );
}

export const metadata: Metadata = {
        title: "OnChain Rock Legends",
        description: "Revive the classic Rock Legends game with blockchain technology. Enjoy a decentralized, secure, and transparent gaming experience inspired by Facebook's timeless hit.",
        other: { "fc:frame": JSON.stringify({"version":"next","imageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/thumbnail_89335d20-8170-4907-8ee8-254352f8d137-2Nktjsz78VXouGNRfBTP5EEZZIV7Xz","button":{"title":"Open with Ohara","action":{"type":"launch_frame","name":"OnChain Rock Legends","url":"https://thirty-brief-711.app.ohara.ai","splashImageUrl":"https://usdozf7pplhxfvrl.public.blob.vercel-storage.com/farcaster/splash_images/splash_image1.svg","splashBackgroundColor":"#ffffff"}}}
        ) }
    };
