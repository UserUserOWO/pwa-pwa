"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/LanguageContext";
import { getUserRole, getAllUsersWithRoles, updateUserRole, hasMinRole } from "@/services/roles";
import { getAuditLogs } from "@/services/audit";
import { getAllPurchases } from "@/services/purchaseHistory";
import { getWallet, depositCredits, spendCredits } from "@/services/wallet";
import { UserRoleType, AuditLog, PurchaseHistory } from "@/types";
import { FiUsers, FiShield, FiCreditCard, FiActivity, FiSearch } from "react-icons/fi";

type AdminTab = "users" | "audit" | "payments" | "stats";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRoleType | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [purchases, setPurchases] = useState<PurchaseHistory[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditAction, setCreditAction] = useState<"add" | "remove">("add");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }
    if (!loading && user) {
      getUserRole(user.id).then((role) => {
        if (!role || !hasMinRole(role.role, "ADMIN")) {
          router.push("/feed");
          return;
        }
        setUserRole(role.role);
        loadData();
      });
    }
  }, [user, loading]);

  const loadData = async () => {
    const [usersData, auditData, purchasesData] = await Promise.all([
      getAllUsersWithRoles({ limit: 100 }),
      getAuditLogs({ limit: 50 }),
      getAllPurchases({ limit: 50 }),
    ]);
    setUsers(usersData);
    setAuditLogs(auditData);
    setPurchases(purchasesData);
    setPageLoading(false);
  };

  const handleRoleChange = async (targetUserId: string, newRole: UserRoleType) => {
    await updateUserRole(targetUserId, newRole);
    loadData();
  };

  const handleCreditAction = async () => {
    if (!creditUserId || creditAmount <= 0) return;
    if (creditAction === "add") {
      await depositCredits(creditUserId, creditAmount, "Admin adjustment");
    } else {
      await spendCredits(creditUserId, creditAmount, "Admin adjustment");
    }
    setCreditUserId("");
    setCreditAmount(0);
  };

  if (loading || pageLoading || !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: any }[] = [
    { key: "users", label: "Users", icon: FiUsers },
    { key: "audit", label: "Audit Log", icon: FiActivity },
    { key: "payments", label: "Payments", icon: FiCreditCard },
    { key: "stats", label: "Stats", icon: FiShield },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-amber-400 text-amber-900"
                : "bg-white text-gray-600 hover:bg-amber-50 border border-amber-100"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Credit Adjustment */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Adjust Credits</h2>
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">User ID</label>
                <input
                  type="text"
                  value={creditUserId}
                  onChange={(e) => setCreditUserId(e.target.value)}
                  placeholder="user_id"
                  className="px-3 py-2 border border-amber-200 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="px-3 py-2 border border-amber-200 rounded-xl text-sm w-24"
                />
              </div>
              <select
                value={creditAction}
                onChange={(e) => setCreditAction(e.target.value as "add" | "remove")}
                className="px-3 py-2 border border-amber-200 rounded-xl text-sm"
              >
                <option value="add">Add</option>
                <option value="remove">Remove</option>
              </select>
              <button
                onClick={handleCreditAction}
                className="px-4 py-2 bg-amber-400 text-amber-900 rounded-xl text-sm font-semibold hover:bg-amber-500"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="p-4 border-b border-amber-100">
              <h2 className="font-semibold text-gray-900">Users ({users.length})</h2>
            </div>
            <div className="divide-y divide-amber-50">
              {users.map((u: any) => (
                <div key={u.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{u.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500">{u.user_id}</p>
                  </div>
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value as UserRoleType)}
                    className="px-3 py-1.5 border border-amber-200 rounded-xl text-sm"
                  >
                    <option value="USER">USER</option>
                    <option value="BUSINESS">BUSINESS</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Tab */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <h2 className="font-semibold text-gray-900">Audit Log</h2>
          </div>
          <div className="divide-y divide-amber-50 max-h-[600px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                    {log.action}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-600">
                  {log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <h2 className="font-semibold text-gray-900">Purchase History</h2>
          </div>
          <div className="divide-y divide-amber-50">
            {purchases.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{p.credits} Credits</p>
                  <p className="text-xs text-gray-500">{p.payment_provider} • {new Date(p.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  p.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  p.status === "FAILED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === "stats" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <p className="text-sm text-gray-500">Total Purchases</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{purchases.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-amber-100">
            <p className="text-sm text-gray-500">Audit Events</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{auditLogs.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}