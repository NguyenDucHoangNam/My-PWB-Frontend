import React from "react";

interface DeleteConfirmationModalProps {
    packageId: number;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
    packageId,
    onClose,
    onConfirm,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-sm shadow-2xl border border-red-500/50 transform transition-all scale-100 opacity-100">
                <div className="p-6 text-center">
                    <svg
                        className="mx-auto mb-4 h-14 w-14 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        ></path>
                    </svg>
                    <h3 className="mb-5 text-lg font-semibold text-white">
                        Xác nhận xóa Gói Khám Phá
                    </h3>
                    <p className="text-gray-300">
                        Bạn có chắc chắn muốn xóa **Gói ID: {packageId}** này không?
                        Thao tác này không thể hoàn tác.
                    </p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button
                            onClick={onConfirm}
                            type="button"
                            className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center transition duration-150"
                        >
                            Đồng ý, Xóa
                        </button>
                        <button
                            onClick={onClose}
                            type="button"
                            className="text-gray-400 bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-lg border border-gray-500 text-sm font-medium px-5 py-2.5 transition duration-150"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;