import { useSearchParams } from "react-router-dom";
import ContractPaymentReturnPage from "./ContractPaymentReturnPage";
import TerminationPaymentReturnPage from "./termination/TerminationPaymentReturnPage";

interface Props {
  mode?: "return" | "cancel";
}

/**
 * Wrapper component to detect payment type and route to appropriate page
 * Detects termination payment by checking sessionStorage for termination payment keys
 */
export default function PaymentReturnWrapper({ mode = "return" }: Props) {
  const [params] = useSearchParams();
  let contractId = params.get("contractId") || params.get("id");
  const orderCode = params.get("orderCode");
  
  // Backend redirect có thể trả về "id" thay vì "contractId" (ví dụ: ?id=17e77ce78cda432495c13fe00ca3c4a9)
  // Nếu có "id" nhưng chưa có contractId, sử dụng "id" làm contractId
  if (!contractId && params.get("id")) {
    contractId = params.get("id");
  }
  
  // If we have orderCode but no contractId, try to extract contractId from localStorage/sessionStorage
  if (orderCode && !contractId) {
    // Search all localStorage keys for termination payment pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("termination_pay_order_")) {
        const storedOrderCode = localStorage.getItem(key);
        if (storedOrderCode === orderCode) {
          // Extract contractId from key: "termination_pay_order_{contractId}"
          contractId = key.replace("termination_pay_order_", "");
          break;
        }
      }
    }
    
    // If still no contractId, try sessionStorage (fallback)
    if (!contractId) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("termination_pay_order_")) {
          const storedOrderCode = sessionStorage.getItem(key);
          if (storedOrderCode === orderCode) {
            contractId = key.replace("termination_pay_order_", "");
            break;
          }
        }
      }
    }
    
    // If still no contractId, try regular payment pattern
    if (!contractId) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("pay_order_")) {
          const storedOrderCode = localStorage.getItem(key);
          if (storedOrderCode === orderCode) {
            contractId = key.replace("pay_order_", "");
            break;
          }
        }
      }
    }
    
    // Fallback to sessionStorage for regular payment
    if (!contractId) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("pay_order_")) {
          const storedOrderCode = sessionStorage.getItem(key);
          if (storedOrderCode === orderCode) {
            contractId = key.replace("pay_order_", "");
            break;
          }
        }
      }
    }
  }
  
  // Check if this is a termination payment by looking for termination payment storage key
  let isTerminationPayment = false;
  
  if (contractId) {
    // Check localStorage first, then sessionStorage (fallback)
    const terminationKey = `termination_pay_order_${contractId}`;
    const storedOrderCode = localStorage.getItem(terminationKey) || sessionStorage.getItem(terminationKey);
    
    if (storedOrderCode) {
      // If orderCode matches stored termination order code, it's termination payment
      if (orderCode && storedOrderCode === orderCode) {
        isTerminationPayment = true;
      } else if (!orderCode) {
        // If no orderCode in URL but we have stored termination order code, assume termination
        isTerminationPayment = true;
      }
    }
  }
  
  // If we have orderCode but still no contractId, try to find termination payment in all storage keys
  if (!isTerminationPayment && orderCode && !contractId) {
    // Search all localStorage keys for termination payment pattern
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("termination_pay_order_")) {
        const storedOrderCode = localStorage.getItem(key);
        if (storedOrderCode === orderCode) {
          isTerminationPayment = true;
          break;
        }
      }
    }
    
    // Fallback to sessionStorage
    if (!isTerminationPayment) {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith("termination_pay_order_")) {
          const storedOrderCode = sessionStorage.getItem(key);
          if (storedOrderCode === orderCode) {
            isTerminationPayment = true;
            break;
          }
        }
      }
    }
  }

  // Route to appropriate page
  if (isTerminationPayment) {
    // Pass projectId and contractId to TerminationPaymentReturnPage if available
    return <TerminationPaymentReturnPage mode={mode} />;
  }

  // Default to contract payment return page
  return <ContractPaymentReturnPage mode={mode} />;
}
