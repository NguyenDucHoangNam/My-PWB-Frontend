import { useState, useEffect } from 'react';
import contractService, { calculateIsFunded } from '../../../services/contractService';

/**
 * Hook để kiểm tra trạng thái hợp đồng của project
 */
export const useWorkspaceContract = (projectId: number | null) => {
    const [hasContract, setHasContract] = useState<boolean>(true);
    const [checkingContract, setCheckingContract] = useState<boolean>(true);
    const [contractStatus, setContractStatus] = useState<string | null>(null);
    const [isFunded, setIsFunded] = useState<boolean>(false);

    useEffect(() => {
        const checkContract = async () => {
            if (!projectId) {
                setCheckingContract(false);
                return;
            }
            try {
                setCheckingContract(true);
                const contractMetadata = await contractService.getContractMetadata(projectId);
                setHasContract(contractMetadata !== null);
                if (contractMetadata) {
                    setContractStatus(contractMetadata.signnowStatus || null);
                    // Tính isFunded từ status: chỉ PAID
                    const status = contractMetadata.signnowStatus;
                    setIsFunded(calculateIsFunded(status));
                } else {
                    setContractStatus(null);
                    setIsFunded(false);
                }
            } catch (err: any) {
                // Nếu error là CONTRACT_NOT_FOUND, 404, hoặc không tìm thấy contract
                const errorCode = err?.response?.data?.error;
                const statusCode = err?.response?.status;

                if (
                    errorCode === 'CONTRACT_NOT_FOUND' ||
                    statusCode === 404 ||
                    err?.message?.includes('hợp đồng') ||
                    err?.message?.includes('contract') ||
                    err?.message?.includes('not found')
                ) {
                    setHasContract(false);
                    setContractStatus(null);
                    setIsFunded(false);
                } else {
                    // Các lỗi khác, giả sử có contract để không block UI
                    console.warn('Error checking contract:', err);
                    setHasContract(true);
                    setContractStatus(null);
                    setIsFunded(false);
                }
            } finally {
                setCheckingContract(false);
            }
        };
        checkContract();
    }, [projectId]);

    return {
        hasContract,
        checkingContract,
        contractStatus,
        isFunded,
    };
};

