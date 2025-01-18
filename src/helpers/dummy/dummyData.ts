import Vest from "../../assets/images/vest.jpeg";
import Bag from "../../assets/images/bag.jpg";
import Light from "../../assets/images/light.jpg";
import Mixer from "../../assets/images/mixer.jpg";
import Iphone from "../../assets/images/iphone.jpeg";
import Camera from "../../assets/images/camera.jpg";

export const products = [
  {
    id: 1,
    name: "Training Vest",
    price: 100,
    imageUrl: Vest,
    quantity: 10,
  },
  {
    id: 2,
    name: "Bag pack",
    price: 250,
    imageUrl: Bag,
    quantity: 5,
  },
  {
    id: 3,
    name: "Table light",
    price: 1500,
    imageUrl: Light,
    quantity: 20,
  },
  {
    id: 4,
    name: "Iphone 15 pro max grey",
    price: 1500,
    imageUrl: Iphone,
    quantity: 12,
  },
  {
    id: 5,
    name: "Sony E60D Camera",
    price: 3620,
    imageUrl: Camera,
    quantity: 14,
  },
  {
    id: 6,
    name: "Food mixer",
    price: 1470,
    imageUrl: Mixer,
    quantity: 7,
  },
];

export const categoryProducts = [
  {
    id: 1,
    name: "Training Vest",
    price: 100,
    imageUrl: Vest,
    brand: "Nike",
    code: "NK452",
    availability: "In stock",
    discountPrice: 1000,
    discountPercentage: 15,
    reviewStars: 1,
    reviews: 45,
  },
  {
    id: 2,
    name: "Bag pack",
    price: 250,
    imageUrl: Bag,
    brand: "Puma",
    code: "Bg596",
    availability: "In stock",
    discountPrice: 1000,
    discountPercentage: 5,
    reviewStars: 1,
    reviews: 21,
  },
  {
    id: 3,
    name: "Table light",
    price: 1500,
    imageUrl: Light,
    brand: "HiSense",
    code: "NK452",
    availability: "In stock",
    discountPrice: 1000,
    discountPercentage: 15,
    reviewStars: 1,
    reviews: 45,
  },
  {
    id: 4,
    name: "Iphone 15 pro max grey",
    price: 1500,
    imageUrl: Iphone,
    brand: "Apple",
    code: "Ip15",
    availability: "Out of stock",
    discountPrice: 2300,
    discountPercentage: 12,
    reviewStars: 4,
    reviews: 6,
  },
  {
    id: 5,
    name: "Sony E60D Camera",
    price: 3620,
    imageUrl: Camera,
    brand: "Sony",
    code: "So785",
    availability: "In stock",
    discountPrice: 1000,
    discountPercentage: 15,
    reviewStars: 3,
    reviews: 12,
  },
  {
    id: 6,
    name: "Food mixer",
    price: 1470,
    imageUrl: Mixer,
    brand: "Hisense",
    code: "B583",
    availability: "Out of Stock",
    discountPrice: 2500,
    discountPercentage: 15,
    reviewStars: 1,
    reviews: 0,
  },
];

export const reviewData = [
  {
    reviewId: 1,
    productName: "Training Vest",
    productImage: Vest,
    orderNumber: "123456789",
    deliveryDate: "16/06/2024",
  },
  {
    reviewId: 2,
    productName: "Bag pack",
    productImage: Bag,
    orderNumber: "123456789",
    deliveryDate: "16/06/2024",
  },
  {
    reviewId: 3,
    productName: "Table light",
    productImage: Light,
    orderNumber: "123456789",
    deliveryDate: "16/06/2024",
  },
  {
    reviewId: 4,
    productName: "Iphone 12 pro max",
    productImage: Iphone,
    orderNumber: "123456789",
    deliveryDate: "16/06/2024",
  },
  {
    reviewId: 5,
    productName: "Sony E60D Camera",
    productImage: Camera,
    orderNumber: "123456789",
    deliveryDate: "16/06/2024",
  },
  {
    reviewId: 6,
    productName: "Food mixer",
    productImage: Mixer,
    orderNumber: "123456789",
    deliveryDate: "16/06/2024",
  },
];

export const submittedReviewData = [
  {
    reviewId: 1,
    productImage: Vest,
    productName: "Training Vest",
    productPrice: 1000,
    productRating: 2,
    reviewDate: "16/06/2024",
    reviewTitle: "Good product",
    reviewContent:
      "I love how comfortable the vest is. It is very easy to wash and it is very durable. I would recommend it to anyone who is looking for a good quality vest.",
  },
  {
    reeviewId: 2,
    productImage: Bag,
    productName: "Bag pack",
    productPrice: 250,
    productRating: 3,
    reviewDate: "16/06/2024",
    reviewTitle: "Good product",
    reviewContent:
      "I love how comfortable the vest is. It is very easy to wash and it is very durable. I would recommend it to anyone who is looking for a good quality vest.",
  },
  {
    reeviewId: 3,
    productImage: Light,
    productName: "Table light",
    productPrice: 1500,
    productRating: 4,
    reviewDate: "16/06/2024",
    reviewTitle: "Good product",
    reviewContent:
      "I love how comfortable the vest is. It is very easy to wash and it is very durable. I would recommend it to anyone who is looking for a good quality vest.",
  },
  {
    reeviewId: 4,
    productImage: Iphone,
    productName: "Iphone 12 pro max",
    productPrice: 1500,
    productRating: 5,
    reviewDate: "16/06/2024",
    reviewTitle: "Good product",
    reviewContent:
      "I love how comfortable the vest is. It is very easy to wash and it is very durable. I would recommend it to anyone who is looking for a good quality vest.",
  },
  {
    reeviewId: 5,
    productImage: Camera,
    productName: "Sony E60D Camera",
    productPrice: 3620,
    productRating: 1,
    reviewDate: "16/06/2024",
    reviewTitle: "Good product",
    reviewContent:
      "I love how comfortable the vest is. It is very easy to wash and it is very durable. I would recommend it to anyone who is looking for a good quality vest.",
  },
  {
    reeviewId: 6,
    productImage: Mixer,
    productName: "Food mixer",
    productPrice: 1470,
    productRating: 3,
    reviewDate: "16/06/2024",
    reviewTitle: "Good product",
    reviewContent:
      "I love how comfortable the vest is. It is very easy to wash and it is very durable."
  }
];

export const vouchersData =[
  {
    id: 1,
    name: "Xmas bonus",
    code: "XMAS2021",
    discount: 20,
    expiryDate: "12/25/2021",
    category: "Decor",
    status: "Active"
  },
  {
    id: 2,
    name: "New Year bonus",
    code: "NEWYEAR2022",
    discount: 15,
    expiryDate: "01/01/2022",
    category: "Electronics",
    status: "Expired"
  },
  {
    id: 3,
    name: "Black Friday bonus",
    code: "BF2021",
    discount: 30,
    expiryDate: "11/26/2021",
    category: "Fashion",
    status: "Expired"
  },
  {
    id: 4,
    name: "Cyber Monday bonus",
    code: "CM2021",
    discount: 25,
    expiryDate: "11/29/2021",
    category: "Electronics",
    status: "Active"
  },
  {
    id: 5,
    name: "Easter bonus",
    code: "EASTER2022",
    discount: 10,
    expiryDate: "04/17/2022",
    category: "Fashion",
    status: "Expired"
  },
  {
    id: 6,
    name: "Valentine bonus",
    code: "VAL2022",
    discount: 15,
    expiryDate: "02/14/2022",
    category: "Fashion",
    status: "Active"
  },
  {
    id: 6,
    name: "Valentine bonus",
    code: "VAL2022",
    discount: 15,
    expiryDate: "02/14/2022",
    category: "Fashion",
    status: "Active"
  },
  {
    id: 6,
    name: "Valentine bonus",
    code: "VAL2022",
    discount: 15,
    expiryDate: "02/14/2022",
    category: "Fashion",
    status: "Active"
  },
  {
    id: 6,
    name: "Valentine bonus",
    code: "VAL2022",
    discount: 15,
    expiryDate: "02/14/2022",
    category: "Fashion",
    status: "Expired"
  },
  {
    id: 6,
    name: "Valentine bonus",
    code: "VAL2022",
    discount: 15,
    expiryDate: "02/14/2022",
    category: "Fashion",
    status: "Expired"
  },
  {
    id: 6,
    name: "Valentine bonus",
    code: "VAL2022",
    discount: 15,
    expiryDate: "02/14/2022",
    category: "Fashion",
    status: "Expired"
  },
]
