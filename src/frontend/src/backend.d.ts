import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export type Time = bigint;
export interface NoticeInput {
    title: string;
    content: string;
    isImportant: boolean;
    imageId: [] | [string];
}
export interface NewsInput {
    title: string;
    content: string;
    imageId: [] | [string];
    isBreaking: boolean;
}
export interface ComplaintEditInput {
    status: Status;
    officerRemarks?: string;
    workerId?: string;
    subject: string;
    complaintType: string;
    statusDescription?: string;
    workAddress: string;
    complainantName: string;
    companyName: string;
    details: string;
    priority: Priority;
    mobile: string;
    department?: string;
    officer?: string;
    incidentDate: string;
    nextStep?: string;
}
export interface Complaint {
    attachmentIds: Array<string>;
    status: Status;
    officerRemarks?: string;
    workerId?: string;
    subject: string;
    complaintType: string;
    createdAt: Time;
    statusDescription?: string;
    complaintNumber: string;
    updatedAt: Time;
    workAddress: string;
    complainantName: string;
    companyName: string;
    details: string;
    priority: Priority;
    mobile: string;
    department?: string;
    officer?: string;
    incidentDate: string;
    nextStep?: string;
}
export interface Notice {
    title: string;
    content: string;
    isImportant: boolean;
    imageId: [] | [string];
    createdAt: Time;
}
export interface News {
    id: string;
    title: string;
    content: string;
    imageId: [] | [string];
    isBreaking: boolean;
    createdAt: Time;
}
export interface ComplaintStats {
    resolved: bigint;
    total: bigint;
    pending: bigint;
    urgent: bigint;
}
export interface ComplaintInput {
    attachmentIds: Array<string>;
    workerId?: string;
    subject: string;
    complaintType: string;
    workAddress: string;
    complainantName: string;
    companyName: string;
    details: string;
    priority: Priority;
    mobile: string;
    incidentDate: string;
}
export enum Priority {
    normal = "normal",
    urgent = "urgent",
    veryUrgent = "veryUrgent"
}
export enum Status {
    resolved = "resolved",
    pending = "pending",
    investigating = "investigating",
    underReview = "underReview",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addNotice(input: NoticeInput): Promise<string>;
    addNews(input: NewsInput): Promise<string>;
    addNoticeWithPassword(password: string, input: NoticeInput): Promise<string>;
    addNewsWithPassword(password: string, input: NewsInput): Promise<string>;
    addOfficerRemarks(complaintNumber: string, remarks: string, nextStep: string): Promise<void>;
    addOfficerRemarksWithPassword(password: string, complaintNumber: string, remarks: string, nextStep: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignOfficer(complaintNumber: string, officer: string, department: string): Promise<void>;
    assignOfficerWithPassword(password: string, complaintNumber: string, officer: string, department: string): Promise<void>;
    deleteComplaint(complaintNumber: string): Promise<void>;
    deleteComplaintWithPassword(password: string, complaintNumber: string): Promise<void>;
    deleteNotice(noticeId: string): Promise<void>;
    deleteNoticeWithPassword(password: string, noticeId: string): Promise<void>;
    deleteNews(newsId: string): Promise<void>;
    deleteNewsWithPassword(password: string, newsId: string): Promise<void>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getAllComplaintsWithPassword(password: string): Promise<Array<Complaint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintByNumber(complaintNumber: string): Promise<Complaint>;
    getComplaintStats(): Promise<ComplaintStats>;
    getComplaintStatsWithPassword(password: string): Promise<ComplaintStats>;
    getNotices(): Promise<Array<Notice>>;
    getNews(): Promise<Array<News>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitComplaint(input: ComplaintInput): Promise<string>;
    updateComplaint(complaintNumber: string, input: ComplaintEditInput): Promise<void>;
    updateComplaintWithPassword(password: string, complaintNumber: string, input: ComplaintEditInput): Promise<void>;
    updateComplaintStatus(complaintNumber: string, newStatus: Status): Promise<void>;
    updateComplaintStatusWithDescription(complaintNumber: string, newStatus: Status, description: string): Promise<void>;
    updateComplaintStatusWithPassword(password: string, complaintNumber: string, newStatus: Status, description: string): Promise<void>;
}
