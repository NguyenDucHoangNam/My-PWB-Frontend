import { ROUTER } from "../routes/router";
import { portfolioService } from "../services/portfolioService";

/**
 * Get portfolio URL - prefers slug if available, falls back to userId
 * @param userId - User ID
 * @param slug - Optional custom URL slug
 * @returns Portfolio URL string
 */
export function getPortfolioUrl(userId: number, slug?: string | null): string {
    // If slug is provided and not empty, use slug route
    if (slug && slug.trim()) {
        return ROUTER.USER.VIEW_PORTFOLIO_BY_SLUG.replace(":slug", slug);
    }
    // Otherwise, use userId route
    return ROUTER.USER.VIEW_PORTFOLIO.replace(":userId", userId.toString());
}

/**
 * Navigate to portfolio - tries to fetch slug first, then navigates
 * @param navigate - React Router navigate function
 * @param userId - User ID
 * @param slug - Optional custom URL slug (if not provided, will try to fetch)
 */
export async function navigateToPortfolio(
    navigate: (path: string) => void,
    userId: number,
    slug?: string | null
): Promise<void> {
    // If slug is already provided, use it
    if (slug && slug.trim()) {
        navigate(getPortfolioUrl(userId, slug));
        return;
    }

    // Try to fetch portfolio to get slug
    try {
        const portfolio = await portfolioService.getPortfolioByUserId(userId);
        if (portfolio.customUrlSlug && portfolio.customUrlSlug.trim()) {
            navigate(getPortfolioUrl(userId, portfolio.customUrlSlug));
        } else {
            navigate(getPortfolioUrl(userId));
        }
    } catch (error) {
        // If fetch fails, fallback to userId route
        console.log("Could not fetch portfolio slug, using userId route:", error);
        navigate(getPortfolioUrl(userId));
    }
}

