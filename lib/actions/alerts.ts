"use server";

import { api } from "@/lib/axios";
import { throwServerActionError } from "../server-error";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  isRead: boolean;
  createdAt: string;
  apiKeyId?: string;
}

export async function getAlertsAction(): Promise<Alert[]> {
  try {
    const { data } = await api.get("/api/v1/alerts");
    return data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return throwServerActionError(error) as any;
  }
}

export async function getUnreadAlertsCountAction() {
  try {
    const { data } = await api.get("/api/v1/alerts/unread-count");
    return data?.count || 0;
  } catch (error) {
    return throwServerActionError(error) as any;
  }
}

export async function markAlertAsReadAction(alertId: string) {
  try {
    await api.post(`/api/v1/alerts/${alertId}/read`);
    return { success: true };
  } catch (error) {
    console.error("Error marking alert as read:", error);
    return throwServerActionError(error) as any;
  }
}

export async function markAllAlertsReadAction() {
  try {
    await api.post("/api/v1/alerts/read-all");
    return { success: true };
  } catch (error) {
    console.error("Error marking all alerts as read:", error);
    return throwServerActionError(error) as any;
  }
}
