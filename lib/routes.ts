export const routes = {
    login: "/signin",
    signup: "/signup",
    unauthorized: "/unauthorized",
    authError: "/auth-error",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    home: "/",
    products: "/products",
    checkout: "/checkout",
    checkoutSuccess: "/checkout/success",

    dashboard: "/dashboard",
    dashboard_products: "/dashboard/products",
    product_create: "/dashboard/products/create",
    dashboard_orders: "/dashboard/orders",
    dashboard_promotions: "/dashboard/promotions",
    dashboard_settings: "/dashboard/settings",

    profile: "/profile",
    profileOrders: "/profile/orders",
    wishlist: "/wishlist",

    api_signup: "/api/auth/signup",
    api_signin: "/api/auth/signin",
    api_verify_token: "/api/auth/verify-token",
    api_resend_verify_token: "/api/auth/resend-verify-token",

    api_upload: "/api/upload",
}

// Routes in this array do not require user authentication (accessible by anyone)
export const publicRoutes = [
    routes.login,
    routes.unauthorized,
    routes.authError,
    routes.signup,
    routes.verifyEmail,
    routes.forgotPassword,
    routes.resetPassword,
    routes.home,
    routes.products,
    routes.checkout, // Checkout entry page is public, login check is performed inline during action
]