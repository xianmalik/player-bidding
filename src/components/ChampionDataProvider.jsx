"use client";

import { useEffect } from "react";
import useChampionStore from "../stores/championStore";

export default function ChampionDataProvider({ children }) {
  const { fetchChampions } = useChampionStore();

  useEffect(() => {
    // Initialize champion data on app load
    fetchChampions();
  }, [fetchChampions]);

  return <>{children}</>;
}
