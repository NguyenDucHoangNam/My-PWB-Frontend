import type { TerminationPreviewResponse } from "../types/contract";

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

// Helper function to format date
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Helper function to format datetime
export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
};

// Determine if response is for Owner or Client
// Owner response có totalTeamCompensation hoặc teamMembers
// Client response có compensationAmount
export const isOwnerResponse = (data: TerminationPreviewResponse): boolean => {
  return (data.totalTeamCompensation !== undefined || data.teamMembers !== undefined) && 
         data.compensationAmount === undefined;
};
