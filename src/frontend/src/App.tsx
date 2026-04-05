import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import AdminComplaintDetailPage from "./pages/AdminComplaintDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import ComplaintFormPage from "./pages/ComplaintFormPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import NoticePage from "./pages/NoticePage";
import TrackingPage from "./pages/TrackingPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  ),
});

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: HomePage,
});

const complaintFormRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/complaint/submit",
  component: ComplaintFormPage,
});

const trackingRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/complaint/track",
  component: TrackingPage,
});

const noticeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/notices",
  component: NoticePage,
});

const newsRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/news",
  component: NewsPage,
});

const faqRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/faq",
  component: FAQPage,
});

const contactRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/contact",
  component: ContactPage,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/dashboard",
  component: AdminDashboardPage,
});

const adminComplaintDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/complaint/$complaintNumber",
  component: AdminComplaintDetailPage,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    complaintFormRoute,
    trackingRoute,
    noticeRoute,
    newsRoute,
    faqRoute,
    contactRoute,
  ]),
  adminLoginRoute,
  adminDashboardRoute,
  adminComplaintDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
