/**
 * Helper functions for Team Invitation page
 */

/**
 * Convert role string to Vietnamese label
 */
export const getRoleLabel = (role: string): string => {
  switch (role) {
    case "OWNER":
      return "Chủ dự án";
    case "CLIENT":
      return "Khách hàng";
    case "COLLABORATOR":
      return "Cộng tác viên";
    case "OBSERVER":
      return "Quan sát viên";
    default:
      return role;
  }
};

/**
 * Get CSS classes for role badge based on role
 */
export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case "OWNER":
      return "bg-purple-500/20 text-purple-300 border-purple-500/50";
    case "CLIENT":
      return "bg-blue-500/20 text-blue-300 border-blue-500/50";
    case "COLLABORATOR":
      return "bg-green-500/20 text-green-300 border-green-500/50";
    case "OBSERVER":
      return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/50";
  }
};

/**
 * Format date string to Vietnamese locale format
 */
export const formatDate = (dateString: string): string => {
  try {
    // Thử parse date
    const date = new Date(dateString);

    // Kiểm tra date có hợp lệ không
    if (isNaN(date.getTime())) {
      return "Không xác định";
    }

    // Format date theo locale Việt Nam
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Không xác định";
  }
};

