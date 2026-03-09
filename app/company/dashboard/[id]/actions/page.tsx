"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ApiClient, type GovernanceProposal } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";

interface EquityOption {
  _id: string;
  name: string;
  symbol: string;
  votingRights?: boolean;
}

const CorporateActionsPage = () => {
  const params = useParams();
  const { token, user } = useAuth();
  const companyId = params.id as string;

  const [activeTab, setActiveTab] = useState<"governance" | "news">("governance");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [equities, setEquities] = useState<EquityOption[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    proposalType: "governance",
    description: "",
    endDate: "",
    equityId: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [proposalsRes, equitiesRes] = await Promise.all([
        ApiClient.getCompanyProposals(companyId, undefined, token || undefined),
        ApiClient.getEquities(companyId, token || undefined),
      ]);

      setProposals(proposalsRes.data || []);
      setEquities((equitiesRes.data || []) as EquityOption[]);
    } catch (err: any) {
      setError(err.message || "Failed to load governance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    loadData();
  }, [companyId, token]);

  const votingEnabledEquities = useMemo(
    () => equities.filter((equity) => equity.votingRights),
    [equities],
  );

  const calculatePercentage = (votes: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((votes / total) * 100);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("You must be logged in to create proposals");
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.endDate) {
      setError("Title, description and end date are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await ApiClient.createProposal(
        companyId,
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          proposalType: formData.proposalType,
          endDate: new Date(formData.endDate).toISOString(),
          equityId: formData.equityId || undefined,
        },
        token,
      );

      setSuccess("Proposal created successfully");
      setFormData({
        title: "",
        proposalType: "governance",
        description: "",
        endDate: "",
        equityId: "",
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/95 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Corporate Actions</h1>
          <p className="text-sm text-gray-400 mt-1">Governance proposals and shareholder voting</p>
        </div>

        <div className="flex space-x-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("governance")}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === "governance" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Governance
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === "news" ? "border-b-2 border-white text-white" : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Corporate News
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-600/40 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-green-600/40 bg-green-950/30 p-3 text-sm text-green-300">
            {success}
          </div>
        )}

        {activeTab === "governance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold mb-1">Governance Proposals</h2>
              <p className="text-sm text-gray-400 mb-6">Live shareholder voting sessions for your company</p>

              {loading ? (
                <div className="py-8 text-gray-400">Loading proposals...</div>
              ) : proposals.length === 0 ? (
                <div className="bg-[#111] rounded-lg p-6 border border-gray-800 text-gray-400">
                  No proposals yet. Create your first governance proposal.
                </div>
              ) : (
                proposals.map((proposal) => (
                  <div key={proposal._id} className="bg-[#111] rounded-lg p-6 border border-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{proposal.title}</h3>
                        <p className="text-xs text-gray-500 uppercase mt-1">Type: {proposal.proposalType}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          proposal.status === "active" ? "bg-green-900/30 text-green-400" : "bg-gray-700/30 text-gray-400"
                        }`}
                      >
                        {proposal.status === "active" ? "Active" : "Closed"}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{proposal.description}</p>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Voting Progress</span>
                        <span className="text-gray-400">
                          {proposal.totalVotes} votes (Ends {new Date(proposal.endDate).toLocaleDateString()})
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex">
                        <div
                          className="bg-green-500 h-full"
                          style={{ width: `${calculatePercentage(proposal.votesFor, proposal.totalVotes)}%` }}
                        />
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${calculatePercentage(proposal.votesAgainst, proposal.totalVotes)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-green-500">
                          For: {proposal.votesFor} ({calculatePercentage(proposal.votesFor, proposal.totalVotes)}%)
                        </span>
                        <span className="text-red-500">
                          Against: {proposal.votesAgainst} ({calculatePercentage(proposal.votesAgainst, proposal.totalVotes)}%)
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#111] rounded-lg p-6 border border-gray-800 sticky top-8">
                <h2 className="text-xl font-semibold mb-1">Create Proposal</h2>
                <p className="text-sm text-gray-400 mb-6">Submit a proposal for shareholder voting</p>

                <form className="space-y-4" onSubmit={handleCreateProposal}>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Proposal Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter proposal title"
                      className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white placeholder-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Proposal Type</label>
                    <select
                      value={formData.proposalType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, proposalType: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                    >
                      <option value="governance">Governance</option>
                      <option value="financial">Financial</option>
                      <option value="operational">Operational</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Linked Equity (Optional)</label>
                    <select
                      value={formData.equityId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, equityId: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                    >
                      <option value="">All Voting Shareholders</option>
                      {votingEnabledEquities.map((equity) => (
                        <option key={equity._id} value={equity._id}>
                          {equity.symbol} - {equity.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the proposal in detail"
                      rows={4}
                      className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white placeholder-gray-600 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Voting End Date</label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-green-500 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !token}
                    className="w-full bg-white text-black font-bold py-2 px-4 rounded hover:bg-gray-200 transition-colors mt-2 disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Proposal"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === "news" && (
          <div className="bg-[#111] rounded-lg p-6 border border-gray-800 text-gray-300">
            <h2 className="text-xl font-semibold mb-2">Company Announcements</h2>
            <p className="text-sm text-gray-400">No announcements published yet.</p>
            {user?.role === "company" && (
              <p className="text-xs text-gray-500 mt-3">Use the governance tab to publish shareholder proposals.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateActionsPage;
