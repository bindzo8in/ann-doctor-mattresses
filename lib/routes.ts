export const routes = {
    login: "/signin",
    signup: "/signup",
    unauthorized: "/unauthorized",
    authError: "/auth-error",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    home: "/",


    api_signup: "/api/auth/signup",
    api_signin: "/api/auth/signin",
    api_verify_token: "/api/auth/verify-token",
    api_resend_verify_token: "/api/auth/resend-verify-token"
}

export const publicRoutes = [routes.login, routes.unauthorized, routes.authError, routes.signup, routes.verifyEmail, routes.forgotPassword, routes.resetPassword, routes.home]