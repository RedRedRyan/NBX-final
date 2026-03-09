"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ApiClient, type GovernanceProposal } from "@/lib/api/client";
import { useAuth } from "@/lib/context/AuthContext";

type Holding = {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  value: number;
};

const InvestorDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"holdings" | "dividends" | "governance">("holdings");

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const proposalRes = await ApiClient.getInvestorProposals(undefined, token || undefined);
      setProposals(proposalRes.data || []);

      if (!user?.hederaAccountId) {
        setHoldings([]);
        return;
      }

      const [accountRes, tokenRes] = await Promise.all([
        fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${user.hederaAccountId}`),
        fetch(`https://testnet.mirrornode.hedera.com/api/v1/accounts/${user.hederaAccountId}/tokens?limit=100`),
      ]);

      if (!accountRes.ok || !tokenRes.ok) {
        throw new Error("Failed to load account holdings from Hedera Mirror Node");
      }

      const tokenData = await tokenRes.json();
      const tokenRows = tokenData.tokens || [];

      const holdingRows: Holding[] = [];
      for (const row of tokenRows) {
        try {
          const infoRes = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/tokens/${row.token_id}`);
          if (!infoRes.ok) continue;
          const info = await infoRes.json();
          const decimals = Number(info.decimals || 0);
          const quantity = Number(row.balance || 0) / Math.pow(10, decimals);
          if (quantity <= 0) continue;

          holdingRows.push({
            id: row.token_id,
            symbol: info.symbol || "TOKEN",
            name: info.name || row.token_id,
            quantity,
            value: quantity,
          });
        } catch {
          continue;
        }
      }

      setHoldings(holdingRows);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [token, user?.hederaAccountId]);

  const votedByMe = (proposal: GovernanceProposal) => {
    const votes = proposal.votes || [];
    return votes.some(
      (vote) =>
        vote.voterAccountId === user?.hederaAccountId ||
        (!!user?.email && vote.voterEmail === user.email) ||
        (!!user?.useremail && vote.voterEmail === user.useremail),
    );
  };

  const totalValue = useMemo(() => holdings.reduce((acc, item) => acc + item.value, 0), [holdings]);
  const activeProposalsCount = useMemo(
    () => proposals.filter((proposal) => proposal.status === "active" && !votedByMe(proposal)).length,
    [proposals, user?.hederaAccountId, user?.email, user?.useremail],
  );

  const handleVote = async (proposal: GovernanceProposal, vote: "for" | "against") => {
    if (!token || !user?.hederaAccountId) {
      setError("Connect and authenticate your wallet account to vote");
      return;
    }

    const companyId =
      typeof proposal.companyId === "string" ? proposal.companyId : proposal.companyId?._id;
    if (!companyId) {
      setError("Unable to resolve proposal company");
      return;
    }

    try {
      setVotingId(proposal._id);
      setError(null);
      await ApiClient.voteProposal(
        companyId,
        proposal._id,
        vote,
        user.hederaAccountId,
        user.email || user.useremail,
        token,
      );
      await loadDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to submit vote");
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return <div id="dashboard" className="max-w-7xl mx-auto py-10 text-gray-400">Loading dashboard...</div>;
  }

  return (
    <div id="dashboard">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">Welcome back, Investor</p>
          </div>
          <Link href="/markets" id="badge">
            Explore Markets
          </Link>
        </div>

        {error && <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-300">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-medium mb-1">Portfolio Value</p>
            <h2 className="text-4xl font-bold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</h2>
            <p className="text-gray-500 text-sm mt-2">{holdings.length} active holdings</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-medium mb-1">Active Proposals</p>
            <h2 className="text-4xl font-bold">{activeProposalsCount}</h2>
            <p className="text-gray-500 text-sm mt-2">Awaiting your vote</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <p className="text-gray-400 text-sm font-medium mb-1">Hedera Account</p>
            <h2 className="text-lg font-semibold text-white break-all">{user?.hederaAccountId || "Not connected"}</h2>
            <p className="text-gray-500 text-sm mt-2">On-chain identity</p>
          </div>
        </div>

        <div>
          <div className="flex space-x-2 bg-[#111] p-1 rounded-lg w-fit mb-6 border border-gray-800">
            {(["holdings", "dividends", "governance"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab ? "bg-gray-800 text-white shadow-sm" : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden min-h-[300px] p-6">
            {activeTab === "holdings" && (
              <>
                <h3 className="text-xl font-bold mb-1">Your Holdings</h3>
                <p className="text-sm text-gray-400 mb-6">Live token balances from your Hedera account</p>
                {holdings.length === 0 ? (
                  <div className="text-gray-400">No equities or tokens found under this account.</div>
                ) : (
                  <div className="space-y-3">
                    {holdings.map((holding) => (
                      <div key={holding.id} className="flex items-center justify-between border border-gray-800 rounded-lg p-4">
                        <div>
                          <p className="font-medium text-white">{holding.name}</p>
                          <p className="text-xs text-gray-500">{holding.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{holding.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                          <p className="text-xs text-gray-400">Approx ${holding.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "dividends" && (
              <>
                <h3 className="text-xl font-bold mb-1">Dividends</h3>
                <p className="text-sm text-gray-400 mb-6">Dividend records will appear here after distributions are configured.</p>
                <div className="text-gray-500">No dividend records found.</div>
              </>
            )}

            {activeTab === "governance" && (
              <>
                <h3 className="text-xl font-bold mb-1">Governance</h3>
                <p className="text-sm text-gray-400 mb-6">Vote on active company proposals</p>

                {proposals.length === 0 ? (
                  <div className="text-gray-400">No governance proposals available right now.</div>
                ) : (
                  <div className="space-y-4">
                    {proposals.map((proposal) => {
                      const companyName =
                        typeof proposal.companyId === "string" ? "Company" : proposal.companyId?.name || "Company";
                      const alreadyVoted = votedByMe(proposal);
                      return (
                        <div key={proposal._id} className="bg-black/40 border border-gray-800 rounded-lg p-5">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs text-blue-400 uppercase tracking-wide">{companyName}</p>
                              <h4 className="text-lg font-bold text-white">{proposal.title}</h4>
                            </div>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                proposal.status === "active" ? "bg-green-900/30 text-green-400" : "bg-gray-800 text-gray-400"
                              }`}
                            >
                              {proposal.status === "active" ? "Active" : "Closed"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{proposal.description}</p>
                          <p className="text-xs text-gray-500 mb-4">
                            Ends {new Date(proposal.endDate).toLocaleString()} | For: {proposal.votesFor} | Against: {proposal.votesAgainst}
                          </p>

                          {proposal.status === "active" && !alreadyVoted ? (
                            <div className="flex gap-2">
                              <button
                                disabled={votingId === proposal._id}
                                onClick={() => handleVote(proposal, "against")}
                                className="px-4 py-2 rounded border border-red-900/50 text-red-500 hover:bg-red-900/20 text-sm font-medium disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                disabled={votingId === proposal._id}
                                onClick={() => handleVote(proposal, "for")}
                                className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 text-sm font-medium disabled:opacity-50"
                              >
                                Support
                              </button>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">
                              {alreadyVoted ? "You have already voted on this proposal." : "Voting closed."}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;

