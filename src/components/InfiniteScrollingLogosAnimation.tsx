import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const CompanyLogoData: Array<{ src: string; alt: string }> = [
  { src: '/images/logos/adobe_logo.svg', alt: 'Adobe Logo' },
  { src: '/images/logos/beko_logo.svg', alt: 'Beko Logo' },
  { src: '/images/logos/bt_logo.svg', alt: 'BT Logo' },
  { src: '/images/logos/coca_cola_logo.svg', alt: 'Coca Cola Logo' },
  { src: '/images/logos/duracell_logo.svg', alt: 'Duracell Logo' },
  { src: '/images/logos/ee_logo.svg', alt: 'EE Logo' },
  { src: '/images/logos/hsbc_logo.svg', alt: 'HSBC Logo' },
  { src: '/images/logos/microsoft_logo.svg', alt: 'Microsoft Logo' },
  { src: '/images/logos/nhs_logo.svg', alt: 'NHS Logo' },
  { src: '/images/logos/tiktok_logo.svg', alt: 'TikTok Logo' },
  { src: '/images/logos/unilever_logo.svg', alt: 'Unilever Logo' },
];

const InfiniteScrollingLogosAnimation = () => {
  return (
    <div className="p-5 w-full">
        <div 
          className="flex relative overflow-hidden pointer-events-none select-none" 
          style={{
            WebkitMask: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
            mask: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)'
          }}
        >
          <motion.div
            transition={{
              duration: 60,
              ease: 'linear',
              repeat: Infinity,
            }}
            initial={{ translateX: 0 }}
            animate={{ translateX: '-50%' }}
            className="flex flex-none gap-12 pr-12"
          >
            {[...new Array(2)].fill(0).map((_, index) => (
              <React.Fragment key={index}>
                {CompanyLogoData.map(({ src, alt }) => (
                  <div key={alt} className="relative h-8 w-24 flex-none ">
                    <Image
                      src={src}
                      alt={alt}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </div>
  )};

  export default InfiniteScrollingLogosAnimation;
