export type alertProp = {
  open?: boolean;
  title: string;
  message: string;
  duration?: number;
  type?: string;
  isVisible?: boolean;
  closeHandler: (open: boolean) => void;
};

export type buttonProp = {
  title: string;
  clickHandler: () => void;
  className?: string;
  icon?: JSX.Element;
  loading?: boolean;
};

export type inputProp = {
  id?: string;
  type: string;
  placeholder?: string;
  value: string | number;
  onChange: (event: {value: string, id: string}) => void;
  className?: string;
  disabled?: boolean;
};

export type apploaderProp = {
  height: string;
  width: string;
};

export type MainLayoutProp = {
  children: React.ReactNode;
};

export type CategoryItem = {
  productCategoryId: number;
  productCategory: string;
};

export type CategorySideBarProps = {
  categories: CategoryItem[];
  onCategoryClick: (item: CategoryItem) => void;
  isLoading?: boolean;
};

export type CarouselProps = {
  slides: { imageUrl: string; promo: string; caption: string; link: string }[];
  autoPlayInterval?: number;
};
export type linkCardProp = {
  className?: string;
  imageUrl: string;
  productName: string;
  productTitle: string;
  price: number;
};

export type loggedInUser = {
  address: string;
  businessCategoryId: number;
  businessDocument: string;
  email: string;
  phoneNumber: string;
  shipping_BillingAddress: string;
  id: string;
  fullName: string;
  city?: string
};

