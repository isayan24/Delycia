import axiosInstance from "@/lib/axios";
import { useEffect, useState } from "react";
import {
  ApiTableResponse,
  ApiZoneResponse,
  UseFetchTableReturn,
} from "./types/table.types";

export const useFetchTable = (rid: string | undefined): UseFetchTableReturn => {
  const [tables, setTables] = useState<ApiTableResponse[]>([]);
  const [zones, setZones] = useState<ApiZoneResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchTables = async (rid: string) => {
    setLoading(true);
    
    try {
      const response = await axiosInstance.get(`/tables?rid=${rid}`);

      if (response.data && response.data.tables) {
        setTables(response.data.tables);
      } else {
        setTables([]);
      }
    } catch (error: any) {
      console.error("Error fetching tables:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetZones = async (rid: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/tables/zones?rid=${rid}`);

      if (response.data && response.data.zones) {
        setZones(response.data.zones);
      } else {
        setZones([]);
      }
    } catch (error: any) {
      console.error("Error fetching zones:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!rid) return;
    fetZones(rid);
    fetchTables(rid);
  }, [rid]);

  return { tables, zones, loading, error, fetchTables };
};
