import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'dota2_analyzer_cache';
const MAX_MATCHES = 5;

function getCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : { recentMatches: [], settings: { preferredModel: 'gpt-4o-mini' } };
  } catch {
    return { recentMatches: [], settings: { preferredModel: 'gpt-4o-mini' } };
  }
}

function setCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function useLocalStorage() {
  const [cache, setCacheState] = useState(getCache);

  const saveMatch = useCallback((match) => {
    setCacheState((prev) => {
      const filtered = prev.recentMatches.filter((m) => m.matchId !== match.matchId);
      const updated = [match, ...filtered].slice(0, MAX_MATCHES);
      const next = { ...prev, recentMatches: updated };
      setCache(next);
      return next;
    });
  }, []);

  const updateMatchReport = useCallback((matchId, report) => {
    setCacheState((prev) => {
      const updated = prev.recentMatches.map((m) =>
        m.matchId === matchId ? { ...m, report } : m
      );
      const next = { ...prev, recentMatches: updated };
      setCache(next);
      return next;
    });
  }, []);

  const updateChatHistory = useCallback((matchId, chatHistory) => {
    setCacheState((prev) => {
      const updated = prev.recentMatches.map((m) =>
        m.matchId === matchId ? { ...m, chatHistory } : m
      );
      const next = { ...prev, recentMatches: updated };
      setCache(next);
      return next;
    });
  }, []);

  const setPreferredModel = useCallback((model) => {
    setCacheState((prev) => {
      const next = { ...prev, settings: { ...prev.settings, preferredModel: model } };
      setCache(next);
      return next;
    });
  }, []);

  const getMatch = useCallback((matchId) => {
    return cache.recentMatches.find((m) => m.matchId === matchId);
  }, [cache]);

  return {
    recentMatches: cache.recentMatches,
    preferredModel: cache.settings.preferredModel,
    saveMatch,
    updateMatchReport,
    updateChatHistory,
    setPreferredModel,
    getMatch,
  };
}
