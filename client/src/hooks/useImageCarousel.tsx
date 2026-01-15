"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "@/components/ui/carousel";
import { ImageLoader } from "@/components/image-loader";
import UseOptimizeImage from "./UseOptimizeImage";
import { useMediaQuery } from "react-haiku";

interface ImageCarouselProps {
  images: any[];
  className?: string;
}

export function ImageCarousel({
  images,
  className = "w-full h-full",
}: ImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const isMobile = useMediaQuery("(max-width: 700px)", false);
  
  const plugin = React.useRef(
    Autoplay({
      delay: Math.floor(Math.random() * 6000) + 4000,
      stopOnInteraction: true,
    })
  );

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!images || images.length === 0) return null;

  return (
    <div className="relative w-full h-full">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className={className}
        // onMouseEnter={plugin.current.stop}
        // onMouseLeave={plugin.current.reset}
      >
        <CarouselContent className="h-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="!h-full">
              <Card className="h-full">
                <CardContent className="flex items-center h-full justify-center p-0">
                  <UseOptimizeImage
                    src={image}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    rounded="rounded-lg"
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Uncomment if you want navigation arrows */}
        {/* <CarouselPrevious />
        <CarouselNext /> */}
      </Carousel>
      
      {/* Dots Indicator */}
      {images.length > 1 && (
        <div className={`absolute ${isMobile ? "top-2" : "bottom-2"} left-1/2 transform -translate-x-1/2 flex space-x-2 z-10`}>
          {images.map((_, index) => (
            <button
              key={index}
              style={current === index + 1 ? { backgroundColor: "#fff" } : {backgroundColor: "#fff", opacity: "0.5"}}
              className={`w-1 h-1 rounded-full`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
} 