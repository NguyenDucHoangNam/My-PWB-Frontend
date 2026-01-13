// api là instance axios mà bạn đã cấu hình sẵn (baseURL, interceptor,...)

import apiInstance from "@/config/axiosCustom";

export interface ProPackageRequest {
  name: string;
  description?: string;
  price: number;
  packageType: ProPackageType;
  isActive: boolean;
}
export enum ProPackageType {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export interface ProPackageResponse {
  id: number;
  name: string;
  description?: string;
  price: number;
  packageType: ProPackageType;
  durationMonths: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

class ProPackageService {
  private BASE_URL = "/api/v1/pro-packages";
  async create(data: ProPackageRequest) {
    const res = await apiInstance.post<ApiResponse<ProPackageResponse>>(
      this.BASE_URL,
      data
    );
    return res.data.result;
  }
  async findAll(page = 0, size = 10, sortBy = "id", sortDir = "desc") {
    const res = await apiInstance.get<ApiResponse<Page<ProPackageResponse>>>(
      this.BASE_URL,
      {
        params: { page, size, sortBy, sortDir },
      }
    );

    return res.data.result;
  }
  async findByPackageType(packageType: ProPackageType) {
    const res = await apiInstance.get<ApiResponse<ProPackageResponse[]>>(
      `${this.BASE_URL}/type/${packageType}`
    );

    return res.data.result;
  }
  async search(filters: {
    name?: string;
    packageType?: ProPackageType;
    isActive?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) {
    const {
      name,
      packageType,
      isActive,
      page = 0,
      size = 10,
      sortBy = "id",
      sortDir = "desc",
    } = filters;

    const res = await apiInstance.get<ApiResponse<Page<ProPackageResponse>>>(
      `${this.BASE_URL}/search`,
      {
        params: {
          name,
          packageType,
          isActive,
          page,
          size,
          sortBy,
          sortDir,
        },
      }
    );

    return res.data.result;
  }
  async findById(id: number) {
    const res = await apiInstance.get<ApiResponse<ProPackageResponse>>(
      `${this.BASE_URL}/${id}`
    );
    return res.data.result;
  }
  async update(id: number, data: ProPackageRequest) {
    const res = await apiInstance.put<ApiResponse<ProPackageResponse>>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return res.data.result;
  }
  async delete(id: number) {
    const res = await apiInstance.delete<ApiResponse<void>>(
      `${this.BASE_URL}/${id}`
    );
    return res.data;
  }
}
export const proPackageService = new ProPackageService();
