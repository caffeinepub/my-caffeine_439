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
    addOfficerRemarks(complaintNumber: string, remarks: string, nextStep: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    assignOfficer(complaintNumber: string, officer: string, department: string): Promise<void>;
    deleteNotice(noticeId: string): Promise<void>;
    getAllComplaints(): Promise<Array<Complaint>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getComplaintByNumber(complaintNumber: string): Promise<Complaint>;
    getComplaintStats(): Promise<ComplaintStats>;
    getNotices(): Promise<Array<Notice>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitComplaint(input: ComplaintInput): Promise<string>;
    updateComplaint(complaintNumber: string, input: ComplaintEditInput): Promise<void>;
    updateComplaintStatus(complaintNumber: string, newStatus: Status): Promise<void>;
    updateComplaintStatusWithDescription(complaintNumber: string, newStatus: Status, description: string): Promise<void>;
}
