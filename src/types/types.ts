export interface Member {
  id: number;
  name: string;
  avatarUrl: string;
  role: string;
  permission: 'Collaborator' | 'Client' | 'Viewer';
}

export interface Split {
  memberId: number;
  job: string;
  percentage: number;
}

export interface Milestone {
  id: number;
  name: string;
  status: 'Chưa bắt đầu' | 'Đang làm' | 'Chờ duyệt' | 'Đã hoàn thành';
  assigneeId: number;
  deadline: string;
  cost: number;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
}

export interface AudioFile {
    id: number;
    name: string;
    version: string;
    uploadedAt: string;
    commentCount: number;
}

export interface Contract {
    partyA: string;
    partyB: string;
    scopeSummary: string;
    totalFee: number;
    paymentType: 'full' | 'milestone';
    status: 'Đã ký' | 'Chờ ký';
}

export interface Project {
  id: number;
  name: string;
  client: string;
  imageUrl: string;
  status: string;
  progress: number;
  members: Member[];
  splits: Split[];
  milestones: Milestone[];
  transactions: Transaction[];
  files: AudioFile[];
  contract: Contract | null;
}

export interface Split {
  memberId: number;
  job: string;
  amount: number; // Tên mới đã được đổi
  milestoneId?: number;
}