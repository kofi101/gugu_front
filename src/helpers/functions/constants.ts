export const specialCharPattern = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;
export const uppercasePattern = /[A-Z]/;
export const lowercasePattern = /[a-z]/;
export const digitPattern = /\d/;
export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const addressString = /^[a-zA-Z0-9\s,.'-]{3,}$/;

export const itemsPerPage = 6;
export const boldFont = "font-bold ";

export const sellOnGuguLink = "https://admin.gugugh.com/"

import Vest from "../../assets/images/vest.jpeg";
import Nike from "../../assets/images/camera.jpg";
import Bag from "../../assets/images/bag.jpg";
import Blender from "../../assets/images/mixer.jpg";

export const ordersList = [
  {
    orderId: 1,
    orderNo: "37369638",
    items: 1,
    orderDate: "21/12/12",
    orderImage: Vest,
    eta: "21/12/12",
    total: 179.11,
    status: "En-route",
  },
  {
    orderId: 2,
    orderNo: "25366738",
    items: 6,
    orderDate: "21/12/12",
    orderImage: Nike,
    eta: "21/12/12",
    total: 7250,
    status: "Pending",
  },
  {
    orderId: 3,
    orderNo: "87566738",
    items: 7,
    orderImage: Bag,
    orderDate: "21/12/12",
    eta: "21/12/12",
    total: 1250,
    status: "Delivered",
  },
  {
    orderId: 4,
    orderNo: "23516738",
    items: 4,
    orderImage: Blender,
    orderDate: "21/12/12",
    eta: "21/12/12",
    total: 2510,
    status: "En-route",
  },
];

export const orderDetails = [
  {
    name: "Vest",
    items: 1,
    orderImage: Vest,
    total: 179.11,
  },
  {
    name: "Nike",
    items: 6,
    orderImage: Nike,
    total: 7250,
  },
  {
    name: "Bag",
    items: 7,
    orderImage: Bag,
    total: 1250,

  },
  {
    name: "Blender",
    items: 4,
    orderImage: Blender,
    total: 2510,
  },
];
