
import firebase from 'firebase/compat/app';

export enum UserType {
  INFLUENCER = 'INFLUENCER',
  COMPANY = 'COMPANY',
}

export interface User {
  uid: string;
  email: string;
  name: string;
  type: UserType;
  avatarUrl: string;
  companyName?: string;
  businessRegistrationNumber?: string;
  influencerName?: string; // For influencers
  followerCount?: number; // For influencers
  // New Profile Fields
  bio?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  categories?: string[]; // For influencers
  companyDescription?: string; // For companies
  websiteUrl?: string; // For companies
  phone?: string;
  kakaoId?: string;
  // Admin fields
  role?: 'admin' | 'user';
  status?: 'active' | 'suspended' | 'pending' | 'rejected' | 'profile_pending' | 'dormant' | 'deletion_requested';
  lastLogin?: firebase.firestore.Timestamp;
  deletionRequestDate?: firebase.firestore.Timestamp | null;
  // Plan fields for companies
  plan?: 'free' | 'pro' | 'enterprise';
  followerSearchLimit?: number;
  planExpiryDate?: firebase.firestore.Timestamp;
  // Company specific limits
  proposalLimit?: number; // Monthly proposal limit
  monthlyProposalsSent?: number; // Proposals sent in the current month
  // Influencer specific limits
  requestLimit?: number; // Monthly collaboration request limit
  monthlyRequestsSent?: number; // Collaboration requests sent in the current month
}

export type Language = 'ko' | 'en';

export type MainContent = 'dashboard' | 'profile' | 'find-influencers' | 'public-profile' | 'proposals' | 'campaigns' | 'my-products' | 'product-market' | 'collaboration-requests' | 'sent-requests' | 'admin' | 'schedule';

export type PublicProfile = Omit<User, 'email' | 'name' | 'businessRegistrationNumber'>;

// For Campaign Proposals
export enum ProposalPayoutType {
    FIXED = 'FIXED',
    COMMISSION = 'COMMISSION'
}

export enum ProposalStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    COMPLETED = 'completed'
}

export interface Proposal {
    id: string;
    brandId: string;
    brandName: string;
    influencerId: string;
    influencerName: string;
    productName: string;
    productLink: string;
    productPrice: number;
    groupBuyPrice?: number;
    payoutType: ProposalPayoutType;
    payoutValue: number; // This will hold either the fixed amount or the commission rate
    status: ProposalStatus;
    createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
    influencerContact?: {
        phone?: string;
        kakaoId?: string;
        email: string;
    };
    hiddenForBrand?: boolean;
    hiddenForInfluencer?: boolean;
}

// For Product Management
export enum SupplyType {
    COMMISSION = 'COMMISSION',
    FIXED = 'FIXED', 
}

export interface Product {
    id: string;
    brandId: string;
    brandName: string;
    productName: string;
    productImageUrl: string;
    productSalesUrl?: string;
    description: string;
    category: string;
    retailPrice: number;
    
    groupBuyPriceConfig: {
        type: 'fixed' | 'negotiable' | 'discretionary';
        value?: number; // Only if type is 'fixed'
    };

    supplyConfig: {
        type: 'fixed' | 'negotiable';
        // These are only present if type is 'fixed'
        supplyType?: SupplyType; // COMMISSION or FIXED
        value?: number;
    };

    createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
    status: 'pending' | 'active' | 'rejected' | 'archived';
}

// For Collaboration Requests (Influencer to Brand)
export enum CollaborationRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface CollaborationRequest {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  influencerId: string;
  influencerName: string;
  influencerAvatarUrl: string;
  brandId: string;
  brandName: string;
  message: string;
  status: CollaborationRequestStatus;
  createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  influencerContact?: {
    email: string;
    phone?: string;
    kakaoId?: string;
  };
  hiddenForBrand?: boolean;
  hiddenForInfluencer?: boolean;
}

// Notifications
export enum NotificationType {
  PROPOSAL_RECEIVED = 'PROPOSAL_RECEIVED', // For Influencer
  REQUEST_ACCEPTED = 'REQUEST_ACCEPTED', // For Influencer
  REQUEST_REJECTED = 'REQUEST_REJECTED', // For Influencer
  COLLABORATION_REQUEST_RECEIVED = 'COLLABORATION_REQUEST_RECEIVED', // For Company
  PROPOSAL_ACCEPTED = 'PROPOSAL_ACCEPTED', // For Company
  PROPOSAL_REJECTED = 'PROPOSAL_REJECTED', // For Company
  PRODUCT_APPROVED = 'PRODUCT_APPROVED', // For Company
  PRODUCT_REJECTED = 'PRODUCT_REJECTED', // For Company
  PRODUCT_RESTORED_FOR_REVIEW = 'PRODUCT_RESTORED_FOR_REVIEW', // For Company
}

export interface Notification {
  id: string;
  userId: string; // The user who receives the notification
  type: NotificationType;
  fromName: string; // Name of the user/brand who triggered the notification
  fromAvatarUrl?: string;
  isRead: boolean;
  link: MainContent;
  relatedId: string; // ID of proposal or request or product
  createdAt: firebase.firestore.Timestamp;
}

// Upgrade Requests
export enum UpgradeRequestStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
}

export interface UpgradeRequest {
    id: string;
    userId: string;
    companyName: string;
    depositorName: string;
    status: UpgradeRequestStatus;
    createdAt: firebase.firestore.Timestamp;
}

// Announcements
export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetUserType: UserType;
  createdAt: firebase.firestore.Timestamp;
}

// Schedule Events
export interface ScheduleEvent {
  id: string;
  userId: string;
  title: string;
  start: string; // ISO8601 string
  end?: string; // ISO8601 string, optional
  allDay: boolean;
  description?: string;
  color: string;
  createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

// Inquiries
export enum InquiryStatus {
    NEW = 'new',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: InquiryStatus;
  createdAt: firebase.firestore.Timestamp;
  userId?: string; // Optional: if submitted by a logged-in user
}