// Google OAuth2 Configuration
export const googleOAuthConfig = {
    clientId: "24496736359-3l9e7tm719hefnb7m7pherana44mknb2.apps.googleusercontent.com",
    redirectUri: `${window.location.origin}/auth/google/callback`,
    scope: "openid email profile",
    responseType: "code",
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth"
};

// Generate Google OAuth URL
export const generateGoogleAuthUrl = (): string => {
    const params = new URLSearchParams({
        client_id: googleOAuthConfig.clientId,
        redirect_uri: googleOAuthConfig.redirectUri,
        scope: googleOAuthConfig.scope,
        response_type: googleOAuthConfig.responseType,
        access_type: "offline",
        prompt: "consent"
    });

    return `${googleOAuthConfig.authUrl}?${params.toString()}`;
};

// Extract authorization code from URL
export const extractAuthCodeFromUrl = (url: string): string | null => {
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('code');
};
