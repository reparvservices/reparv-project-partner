import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import JoinPartnerModal from "../components/partnerPage/JoinPartnerModal";

const PartnerJoinContext = createContext(null);
const AUTO_MODAL_STORAGE_KEY = "reparv_partner_join_modal_last_shown";
const LEGACY_AUTO_MODAL_KEY = "reparv_partner_join_modal_auto_shown";
const AUTO_MODAL_DELAY_MS = 700;
const AUTO_MODAL_INTERVAL_MS = 12 * 60 * 60 * 1000;

function getLastAutoShownAt() {
  const raw =
    localStorage.getItem(AUTO_MODAL_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_AUTO_MODAL_KEY);
  if (!raw) return null;
  const lastShown = Number(raw);
  return Number.isFinite(lastShown) ? lastShown : null;
}

function shouldAutoShowPartnerModal() {
  const lastShown = getLastAutoShownAt();
  if (lastShown === null) return true;
  return Date.now() - lastShown >= AUTO_MODAL_INTERVAL_MS;
}

function markPartnerModalAutoShown() {
  localStorage.setItem(AUTO_MODAL_STORAGE_KEY, String(Date.now()));
  localStorage.removeItem(LEGACY_AUTO_MODAL_KEY);
}

export function PartnerJoinProvider({ children }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!shouldAutoShowPartnerModal()) return undefined;

      const timer = setTimeout(() => {
        markPartnerModalAutoShown();
        setOpen(true);
      }, AUTO_MODAL_DELAY_MS);

      return () => clearTimeout(timer);
    } catch {
      return undefined;
    }
  }, []);

  const openJoinModal = useCallback(() => {
    setOpen(true);
  }, []);

  const closeJoinModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      openJoinModal,
      closeJoinModal,
    }),
    [openJoinModal, closeJoinModal],
  );

  return (
    <PartnerJoinContext.Provider value={value}>
      {children}
      <JoinPartnerModal isOpen={open} onClose={closeJoinModal} />
    </PartnerJoinContext.Provider>
  );
}

export function usePartnerJoin() {
  const ctx = useContext(PartnerJoinContext);
  if (!ctx) {
    throw new Error("usePartnerJoin must be used within PartnerJoinProvider");
  }
  return ctx;
}
