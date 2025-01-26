import { useState, useEffect } from "react";
import { CarouselProps } from "../helpers/type/types";
import { routerPath } from "../routes/Router";
import { useNavigate } from "react-router";
const AppCarousel: React.FC<CarouselProps> = ({
  slides,
  autoPlayInterval = 5000,
}) => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToShopNow = (productId: number | string) => {
    navigate(`${routerPath.PRODUCTDETAILS}${productId}`);
  };

  const goToPreviousSlide = () => {
    const newSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
    setCurrentSlide(newSlide);
  };

  const goToNextSlide = () => {
    const newSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
    setCurrentSlide(newSlide);
  };

  useEffect(() => {
    const timer = setInterval(goToNextSlide, autoPlayInterval);
    return () => clearInterval(timer);
  }, [currentSlide, goToNextSlide, autoPlayInterval]);

  return (
    <div className="carousel-container">
      <div className="carousel-slide h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <img
          src={slides[currentSlide]?.image}
          alt={slides[currentSlide]?.productName}
          className="object-cover object-center w-full h-full "
        />
        <div className="absolute flex flex-col items-center justify-center text-center md:w-1/2 top-28 left-16 text-white-primary-400 carousel-caption md:top-32 md:left-[25%]">
          <p className="mb-6 font-semibold uppercase">
            {slides[currentSlide]?.promotionDescription}
          </p>
          <p className="mb-8 text-xl font-bold uppercase">
            {slides[currentSlide]?.productName}
          </p>
          <a
            onClick={() => goToShopNow(slides[currentSlide]?.productId)}
            className="px-6 py-2 font-semibold capitalize cursor-pointer rounded-2xl bg-white-primary-400 carousel-link text-primary-500 hover:bg-white"
          >
            Shop Now
          </a>
        </div>
      </div>
      <button onClick={goToPreviousSlide} className="carousel-button prev">
        ‹
      </button>
      <button onClick={goToNextSlide} className="carousel-button next">
        ›
      </button>
    </div>
  );
};

export default AppCarousel;
