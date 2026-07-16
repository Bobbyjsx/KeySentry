"use server";

import { api } from "@/lib/axios";
import { throwServerActionError } from "../server-error";
import type { ApiKeyDiscovery } from "./discoveries";

export interface ScanSource {
  id?: string;
  type: string;
  value: string;
  name?: string;
}

export interface ScanResult {
  scanId: string;
}

export interface ScanHistoryRecord {
  id: string;
  scanDate: string;
  status: string;
  trigger: string;
  triggerLink?: string;
  sourcesScanned: number;
  reposScanned: number;
  filesScanned: number;
  durationSeconds: number;
  keysFound: number;
  sources?: { type: string; value: string }[];
}

export interface ScanDetails {
  scan: ScanHistoryRecord;
  keys: ApiKeyDiscovery[];
}

export async function startScanAction(target: string) {
  try {
    const { data } = await api.post("/api/v1/scans/trigger", {
      target,
    });
    return data;
  } catch (error) {
    return throwServerActionError(error);
  }
}

export async function getScanHistoryAction(): Promise<ScanHistoryRecord[]> {
  try {
    const { data } = await api.get("/api/v1/scans/history");
    return data;
  } catch (error) {
    console.error("Error fetching scan history:", error);
    return throwServerActionError(error) as any;
  }
}

export async function getScanDetailsAction(scanId: string) {
  try {
    const { data } = await api.get(`/api/v1/scans/${scanId}`);
    return data;
  } catch (error) {
    console.error("Error fetching scan details:", error);
    return throwServerActionError(error) as any;
  }
}

export async function getScansAction(page = 1, pageSize = 20) {
  try {
    const { data } = await api.get(
      `/api/v1/scans?page=${page}&pageSize=${pageSize}`,
    );
    return data;
  } catch (error) {
    console.error("Error fetching scans:", error);
    return throwServerActionError(error) as any;
  }
}

export async function runManualScanAction(
  targetType: "github_org" | "github_user" | "github_repo" | "local_dir",
  targetValue: string,
) {
  try {
    const { data } = await api.post("/api/v1/scans/manual", {
      targetType,
      targetValue,
    });
    return { success: true, scanId: data.id };
  } catch (error) {
    console.error("Error running manual scan:", error);
    return throwServerActionError(error);
  }
}
