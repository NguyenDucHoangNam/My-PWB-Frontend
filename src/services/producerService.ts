import apiInstance from '../config/axiosCustom';

export interface Producer {
  userId: number;
  fullName: string;
  headline: string;
  avatarUrl: string | null;
  location: string;
  latitude?: number;
  longitude?: number;
  genres: string[];
  tags: string[];
  distanceInKm: number | null;
  rating?: number;
  reviewCount?: number;
}

export interface PageInfo {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface LinkInfo {
  linkType: 'TRACK' | 'ARTIST' | 'ALBUM';
  genres: string[];
  spotifyId: string;
  artistName?: string;
  artistImageUrl?: string;
}

export interface ProducersResponse {
  code: number;
  message?: string;
  result: {
    content?: Producer[];
    page?: PageInfo;
    // For Spotify recommendation response
    linkInfo?: LinkInfo;
    producers?: {
      content: Producer[];
      page: PageInfo;
    };
  };
}
export interface GetProducersParams {
  page?: number;
  size?: number;
  sort?: string;
  search?: string;
  tags?: string[];
  genreIds?: number[];
  lat?: number;
  lon?: number;
  radius?: number;
}

export interface SpotifyRecommendRequest {
  link: string;
  page?: number;
  size?: number;
}

class ProducerService {

  async getProducers(params?: GetProducersParams): Promise<ProducersResponse> {
    try {
      const queryParams = {
        ...params,
        tags: params?.tags?.join(','),
        genreIds: params?.genreIds?.join(','),
      };
      const response = await apiInstance.get<ProducersResponse>('/api/v1/producers', {
        params: queryParams,
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Lỗi khi gọi API lấy danh sách producer:', error);
      throw error;
    }
  }

  async recommendBySpotify(request: SpotifyRecommendRequest): Promise<ProducersResponse> {
    try {
      // Gửi cả trong body và query params để đảm bảo backend nhận được
      const { link, page, size } = request;
      const response = await apiInstance.post<ProducersResponse>(
        '/api/v1/producers/recommend-by-spotify',
        { link, page, size },
        {
          params: {
            ...(page !== undefined && { page }),
            ...(size !== undefined && { size }),
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Lỗi khi gọi API gợi ý producer qua Spotify:', error);
      throw error;
    }
  }
}

export const producerService = new ProducerService();
export default producerService;