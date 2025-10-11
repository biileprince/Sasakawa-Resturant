import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../../contexts/CurrentUserContext";
import { Link } from "react-router-dom";
import {
  getRequests,
  getInvoices,
  getPayments,
} from "../../services/request.service";
import approvalService from "../../services/approval.service";
import apiClient from "../../services/apiClient";
import { formatGhanaDate } from "../../utils/dateFormat";

interface DashboardStats {
  totalRequests: number;
  pendingApprovals: number;
  totalInvoices: number;
  totalPayments: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function FinanceDashboard() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<
    "overview" | "requests" | "finance" | "users"
  >("overview");

  // Fetch data for dashboard
  const { data: requests } = useQuery({
    queryKey: ["all-requests"],
    queryFn: getRequests,
    enabled: currentUser?.role === "FINANCE_OFFICER",
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: approvalService.getPendingApprovals,
    enabled: currentUser?.role === "FINANCE_OFFICER",
  });

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
    enabled: currentUser?.role === "FINANCE_OFFICER",
  });

  const { data: payments } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
    enabled: currentUser?.role === "FINANCE_OFFICER",
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await apiClient.get("/users");
      return response.data;
    },
    enabled: currentUser?.role === "FINANCE_OFFICER",
  });

  // Access control
  if (currentUser?.role !== "FINANCE_OFFICER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Finance Officer Access Required
          </h1>
          <p className="text-gray-600 mb-4">
            This dashboard is reserved for Finance Officers only.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator if you need access to finance functions.
          </p>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats: DashboardStats = {
    totalRequests: requests?.length || 0,
    pendingApprovals: pendingApprovals?.length || 0,
    totalInvoices: invoices?.length || 0,
    totalPayments: payments?.length || 0,
    totalUsers: users?.length || 0,
    totalRevenue:
      payments?.reduce((sum: number, payment: any) => {
        // Exclude cancelled payments from revenue calculation
        if (payment.status === "CANCELLED") {
          return sum;
        }
        const amount = Number(payment.amount || 0);
        return sum + amount;
      }, 0) || 0,
  };

  const getRecentActivity = (): Array<{
    type: string;
    title: string;
    description: string;
    time: string;
    status: string;
    id: string;
  }> => {
    const activities: Array<{
      type: string;
      title: string;
      description: string;
      time: string;
      status: string;
      id: string;
    }> = [];

    // Recent requests
    if (requests?.slice(0, 3)) {
      requests.slice(0, 3).forEach((request: any) => {
        activities.push({
          type: "request",
          title: `New request: ${request.eventName}`,
          description: `Event Date: ${formatGhanaDate(request.eventDate)}`,
          time: formatGhanaDate(request.createdAt),
          status: request.status,
          id: request.id,
        });
      });
    }

    // Recent payments
    if (payments?.slice(0, 2)) {
      payments.slice(0, 2).forEach((payment: any) => {
        activities.push({
          type: "payment",
          title: `Payment received: ₵${payment.amount}`,
          description: `Payment method: ${payment.method}`,
          time: formatGhanaDate(payment.createdAt),
          status: "completed",
          id: payment.id,
        });
      });
    }

    return activities.slice(0, 5);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center mr-4">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Finance Officer
                  </span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Finance Dashboard
              </h1>
              <p className="text-gray-600 max-w-3xl">
                Comprehensive financial management and oversight for restaurant
                operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex overflow-x-auto space-x-4 sm:space-x-8"
            aria-label="Tabs"
          >
            {[
              {
                key: "overview",
                label: "Overview",
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
              },
              {
                key: "requests",
                label: "Requests",
                iconShort: "Req",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                key: "finance",
                label: "Finance",
                iconShort: "Fin",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
              },
              {
                key: "users",
                label: "Users",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`${
                  activeTab === tab.key
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap`}
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={tab.icon}
                  />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.iconShort || tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Requests
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalRequests}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Pending Approvals
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.pendingApprovals}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Invoices
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalInvoices}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Payments
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalPayments}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Users
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalUsers}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      GHS {Number(stats.totalRevenue || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/approvals"
                  className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <svg
                    className="w-8 h-8 text-primary-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">
                      Review Approvals
                    </p>
                    <p className="text-sm text-gray-600">
                      {stats.pendingApprovals} pending
                    </p>
                  </div>
                </Link>

                <Link
                  to="/invoices"
                  className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <svg
                    className="w-8 h-8 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Manage Invoices</p>
                    <p className="text-sm text-gray-600">
                      {stats.totalInvoices} total
                    </p>
                  </div>
                </Link>

                <Link
                  to="/payments"
                  className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <svg
                    className="w-8 h-8 text-yellow-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Track Payments</p>
                    <p className="text-sm text-gray-600">
                      {stats.totalPayments} recorded
                    </p>
                  </div>
                </Link>

                <Link
                  to="/users"
                  className="flex items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <svg
                    className="w-8 h-8 text-primary-600 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Manage Users</p>
                    <p className="text-sm text-gray-600">
                      {stats.totalUsers} users
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {getRecentActivity().map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-3 ${
                          activity.type === "request"
                            ? "bg-primary-400"
                            : "bg-green-400"
                        }`}
                      ></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="status-wrapper">
                      <span
                        className={`status-badge ${
                          activity.status === "completed"
                            ? "status-fulfilled"
                            : activity.status === "SUBMITTED"
                            ? "status-submitted"
                            : activity.status === "APPROVED"
                            ? "status-approved"
                            : activity.status === "REJECTED"
                            ? "status-rejected"
                            : "status-draft"
                        }`}
                      >
                        <i
                          className={`${
                            activity.status === "completed"
                              ? "fas fa-check-double"
                              : activity.status === "SUBMITTED"
                              ? "fas fa-clock"
                              : activity.status === "APPROVED"
                              ? "fas fa-check-circle"
                              : activity.status === "REJECTED"
                              ? "fas fa-times-circle"
                              : "fas fa-file-alt"
                          } mr-1`}
                        ></i>
                        {activity.status === "completed"
                          ? "Completed"
                          : activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Requests & Approvals Management
              </h3>
              <Link
                to="/approvals"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Open Approval Dashboard
                <svg
                  className="ml-2 -mr-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Use the dedicated Approval Dashboard to review, approve, reject,
                or request revisions for service requests.
              </p>
              <p className="text-sm text-gray-500">
                You have {stats.pendingApprovals} requests waiting for your
                review.
              </p>
            </div>
          </div>
        )}

        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Invoice Management
                  </h3>
                  <Link
                    to="/invoices"
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">
                    {stats.totalInvoices}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Invoices Created
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Payment Tracking
                  </h3>
                  <Link
                    to="/payments"
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-semibold text-gray-900 mb-1">
                    GHS {Number(stats.totalRevenue || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Revenue Collected
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                User Management
              </h3>
              <Link
                to="/users"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Manage Users
                <svg
                  className="ml-2 -mr-1 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">
                Manage user roles and permissions across the restaurant
                management system.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalUsers}
                  </p>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {users?.filter((u: any) => u.role === "APPROVER").length ||
                      0}
                  </p>
                  <p className="text-sm text-gray-600">Approvers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-gray-900">
                    {users?.filter((u: any) => u.role === "FINANCE_OFFICER")
                      .length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Finance Officers</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
