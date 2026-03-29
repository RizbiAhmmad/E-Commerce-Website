import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Lazy load components
const Login = lazy(() => import("@/Authentication/Login"));
const SignUp = lazy(() => import("@/Authentication/SignUp"));
const Dashboard = lazy(() => import("@/Layouts/Dashboard"));
const MainLayout = lazy(() => import("@/Layouts/MainLayout"));
const CartPage = lazy(() => import("@/Pages/Cart/CartPage"));
const AddBrand = lazy(() => import("@/Pages/Dashboard/Admin/AddBrand"));
const AddCategory = lazy(() => import("@/Pages/Dashboard/Admin/AddCategory"));
const AddColor = lazy(() => import("@/Pages/Dashboard/Admin/AddColor"));
const AddProduct = lazy(() => import("@/Pages/Dashboard/Admin/AddProduct"));
const AddSize = lazy(() => import("@/Pages/Dashboard/Admin/AddSize"));
const AddSubcategory = lazy(() => import("@/Pages/Dashboard/Admin/AddSubcategory"));
const AllBrands = lazy(() => import("@/Pages/Dashboard/Admin/AllBrands"));
const AllCategories = lazy(() => import("@/Pages/Dashboard/Admin/AllCategories"));
const AllColors = lazy(() => import("@/Pages/Dashboard/Admin/AllColors"));
const AllProducts = lazy(() => import("@/Pages/Dashboard/Admin/AllProducts"));
const AllReviews = lazy(() => import("@/Pages/Dashboard/Admin/AllReviews"));
const AllSizes = lazy(() => import("@/Pages/Dashboard/Admin/AllSizes"));
const AllSubcategories = lazy(() => import("@/Pages/Dashboard/Admin/AllSubcategories"));
const AllUsers = lazy(() => import("@/Pages/Dashboard/Admin/AllUsers"));
const Profile = lazy(() => import("@/Pages/Dashboard/Admin/Profile"));
const Home = lazy(() => import("@/Pages/Home/Home"));
const ProductDetailsPage = lazy(() => import("@/Pages/Home/ProductDetailsPage"));
const CheckoutPage = lazy(() => import("../Pages/Cart/CheckoutPage"));
const AllOrders = lazy(() => import("@/Pages/Dashboard/Admin/AllOrders"));
const MyOrders = lazy(() => import("@/Pages/Dashboard/User/MyOrders"));
const DashboardHome = lazy(() => import("@/Layouts/DashboardHome"));
const AddCoupon = lazy(() => import("@/Pages/Dashboard/Admin/AddCoupon"));
const AllCoupons = lazy(() => import("@/Pages/Dashboard/Admin/AllCoupons"));
const PaymentSuccess = lazy(() => import("@/Pages/Cart/PaymentSuccess"));
const PaymentCancel = lazy(() => import("@/Pages/Cart/PaymentCancel"));
const CategoryProducts = lazy(() => import("@/Pages/Home/CategoryProducts"));
const POSPage = lazy(() => import("@/Pages/POS/POSPage"));
const AllPOSOrders = lazy(() => import("@/Pages/POS/AllPOSOrders"));
const StockReport = lazy(() => import("@/Pages/Dashboard/Admin/StockReport"));
const SalesReport = lazy(() => import("@/Pages/Dashboard/Admin/SalesReport"));
const AddExpenseCategory = lazy(() => import("@/Pages/Dashboard/Admin/AddExpenseCategory"));
const AllExpenseCategory = lazy(() => import("@/Pages/Dashboard/Admin/AllExpenseCategory"));
const AddExpense = lazy(() => import("@/Pages/Dashboard/Admin/AddExpense"));
const AllExpense = lazy(() => import("@/Pages/Dashboard/Admin/AllExpense"));
const ExpenseReport = lazy(() => import("@/Pages/Dashboard/Admin/ExpenseReport"));
const AllCustomersWithSegments = lazy(() => import("@/Pages/Dashboard/Admin/AllCustomersWithSegments"));
const AddDamageProduct = lazy(() => import("@/Pages/Dashboard/Admin/AddDamageProduct"));
const AllDamageProducts = lazy(() => import("@/Pages/Dashboard/Admin/AllDamageProducts"));
const AddReturnProduct = lazy(() => import("@/Pages/Dashboard/Admin/AddReturnProduct"));
const AllReturnProducts = lazy(() => import("@/Pages/Dashboard/Admin/AllReturnProducts"));
const AddSlider = lazy(() => import("@/Pages/Dashboard/Admin/AddSlider"));
const AllSliders = lazy(() => import("@/Pages/Dashboard/Admin/AllSliders"));
const AllFooterInfo = lazy(() => import("@/Pages/Dashboard/Admin/AllFooterInfo"));
const AddFooterInfo = lazy(() => import("@/Pages/Dashboard/Admin/AddFooterInfo"));
const SubcategoryProducts = lazy(() => import("@/Pages/Home/SubcategoryProducts"));
const About = lazy(() => import("@/Pages/Home/About"));
const Contact = lazy(() => import("@/Pages/Home/Contact"));
const AddOffer = lazy(() => import("@/Pages/Dashboard/Admin/AddOffer"));
const AllOffers = lazy(() => import("@/Pages/Dashboard/Admin/AllOffers"));
const CourierSettings = lazy(() => import("@/Pages/Courier/CourierSettings"));
const Favourite = lazy(() => import("@/Pages/Dashboard/User/Favourite"));
const ProfitLossReport = lazy(() => import("@/Pages/Dashboard/Admin/ProfitLossReport"));
const AddPolicy = lazy(() => import("@/Pages/Dashboard/Admin/AddPolicy"));
const AllPolicies = lazy(() => import("@/Pages/Dashboard/Admin/AllPolicies"));
const PrivacyPolicy = lazy(() => import("@/Shared/PrivacyPolicy"));
const RefundPolicy = lazy(() => import("@/Shared/RefundPolicy"));
const TermsConditions = lazy(() => import("@/Shared/TermsConditions"));
const IncompleteOrders = lazy(() => import("@/Pages/Dashboard/Admin/IncompleteOrders"));
const AddLandingPage = lazy(() => import("@/Pages/Dashboard/Admin/AddLandingPage"));
const AllLandingPages = lazy(() => import("@/Pages/Dashboard/Admin/AllLandingPages"));
const LandingPage = lazy(() => import("@/Pages/LandingPage/LandingPage"));
const OrderSuccess = lazy(() => import("@/Pages/Dashboard/User/OrderSuccess"));
const ShippingSettings = lazy(() => import("@/Pages/Dashboard/Admin/ShippingSettings"));
const OrderSuccessPage = lazy(() => import("@/Pages/Dashboard/User/OrderSuccessPage"));
const GTMSettings = lazy(() => import("@/Pages/Dashboard/Admin/GTMSettings"));
const EditProfile = lazy(() => import("@/Pages/Dashboard/Admin/EditProfile"));
const NoticeSettings = lazy(() => import("@/Pages/Dashboard/Admin/NoticeSettings"));
const TrackOrderPage = lazy(() => import("@/Pages/Dashboard/User/TrackOrderPage"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout></MainLayout>,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "login",
        element: <Login></Login>,
      },
      {
        path: "signup",
        element: <SignUp></SignUp>,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "product/:id",
        element: <ProductDetailsPage />,
      },
      {
        path: "category/:id",
        element: <CategoryProducts />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "favourites",
        element: <Favourite />,
      },
      {
        path: "privacyPolicy",
        element: <PrivacyPolicy />,
      },
      {
        path: "ReturnAndRefundPolicy",
        element: <RefundPolicy />,
      },
      {
        path: "TermsAndConditions",
        element: <TermsConditions />,
      },
      {
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "payment-success",
        element: <PaymentSuccess />,
      },
      {
        path: "payment-cancel",
        element: <PaymentCancel />,
      },
      {
        path: "subcategory/:subId",
        element: <SubcategoryProducts />,
      },
      {
        path: "landing-page/:id",
        element: <LandingPage />,
      },
      {
        path: "/order-success/:tran_id",
        element: <OrderSuccess />,
      },
      {
        path: "/myorder",
        element: <OrderSuccessPage />,
      },
      {
  path: "/track-order",
  element: <TrackOrderPage />
}
    ],
  },
  {
    path: "dashboard",
    element: <Dashboard></Dashboard>,
    children: [
      { index: true, element: <DashboardHome /> },

      {
        path: "users",
        element: <AllUsers></AllUsers>,
      },
      {
        path: "profile",
        element: <Profile></Profile>,
      },
      {
        path: "edit-profile",
        element: <EditProfile></EditProfile>,
      },
      {
        path: "addCategory",
        element: <AddCategory></AddCategory>,
      },
      {
        path: "allCategories",
        element: <AllCategories></AllCategories>,
      },
      {
        path: "addSubCategories",
        element: <AddSubcategory></AddSubcategory>,
      },
      {
        path: "allSubCategories",
        element: <AllSubcategories></AllSubcategories>,
      },
      {
        path: "addBrand",
        element: <AddBrand></AddBrand>,
      },
      {
        path: "allBrands",
        element: <AllBrands></AllBrands>,
      },
      {
        path: "addSize",
        element: <AddSize></AddSize>,
      },
      {
        path: "allSizes",
        element: <AllSizes></AllSizes>,
      },
      {
        path: "addColor",
        element: <AddColor></AddColor>,
      },
      {
        path: "allColors",
        element: <AllColors></AllColors>,
      },
      {
        path: "addProduct",
        element: <AddProduct></AddProduct>,
      },
      {
        path: "allProducts",
        element: <AllProducts></AllProducts>,
      },
      {
        path: "allReviews",
        element: <AllReviews></AllReviews>,
      },
      {
        path: "allOrders",
        element: <AllOrders></AllOrders>,
      },
      {
        path: "myOrders",
        element: <MyOrders />,
      },
      {
        path: "stock",
        element: <StockReport />,
      },
      {
        path: "sales",
        element: <SalesReport />,
      },
      {
        path: "ProfitLossReport",
        element: <ProfitLossReport />,
      },
      {
        path: "addCoupon",
        element: <AddCoupon />,
      },
      {
        path: "allCoupons",
        element: <AllCoupons />,
      },
      {
        path: "pos",
        element: <POSPage />,
      },
      {
        path: "posOrders",
        element: <AllPOSOrders />,
      },
      {
        path: "incompleteOrders",
        element: <IncompleteOrders />,
      },
      {
        path: "addExpenseCategory",
        element: <AddExpenseCategory />,
      },
      {
        path: "allExpenseCategories",
        element: <AllExpenseCategory />,
      },
      {
        path: "addExpense",
        element: <AddExpense />,
      },
      {
        path: "allExpense",
        element: <AllExpense />,
      },
      {
        path: "addDamageProduct",
        element: <AddDamageProduct />,
      },
      {
        path: "allDamageProducts",
        element: <AllDamageProducts />,
      },
      {
        path: "addReturnProduct",
        element: <AddReturnProduct />,
      },
      {
        path: "allReturnProducts",
        element: <AllReturnProducts />,
      },
      {
        path: "addSlider",
        element: <AddSlider />,
      },
      {
        path: "allSliders",
        element: <AllSliders />,
      },
      {
        path: "addOffer",
        element: <AddOffer />,
      },
      {
        path: "allOffers",
        element: <AllOffers />,
      },
      {
        path: "addFooterInfo",
        element: <AddFooterInfo />,
      },
      {
        path: "FooterInfo",
        element: <AllFooterInfo />,
      },
      {
        path: "addPolicy",
        element: <AddPolicy />,
      },
      {
        path: "allPolicies",
        element: <AllPolicies />,
      },
      {
        path: "addLandingPage",
        element: <AddLandingPage />,
      },
      {
        path: "allLandingPages",
        element: <AllLandingPages />,
      },
      {
        path: "ExpenseReport",
        element: <ExpenseReport />,
      },
      {
        path: "CustomerSegment",
        element: <AllCustomersWithSegments />,
      },
      {
        path: "CourierSettings",
        element: <CourierSettings />,
      },
      {
        path: "shippingSettings",
        element: <ShippingSettings />,
      },
      {
        path: "gtmSettings",
        element: <GTMSettings />,
      },
      {
        path: "popupSettings",
        element: <NoticeSettings />,
      },
    ],
  },
]);
