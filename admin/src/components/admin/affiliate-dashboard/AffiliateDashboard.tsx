import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, ShoppingBag, Users, IndianRupee, Clock, User, Package } from 'lucide-react';

// Demo data
const salesTrendData = [
  { date: '2024-01-01', sales: 12500 },
  { date: '2024-01-02', sales: 13200 },
  { date: '2024-01-03', sales: 11800 },
  { date: '2024-01-04', sales: 14500 },
  { date: '2024-01-05', sales: 15200 },
  { date: '2024-01-06', sales: 16800 },
  { date: '2024-01-07', sales: 17500 }
];

const categoryReferralData = [
  { name: 'Sweets & Desserts', value: 89, color: '#FF8C42' },
  { name: 'Snacks & Namkeen', value: 67, color: '#FFB366' },
  { name: 'Traditional Meals', value: 45, color: '#FFC98A' },
  { name: 'Beverages', value: 32, color: '#FFE0B3' },
  { name: 'Spices & Masala', value: 23, color: '#D1D5DB' }
];

const topAffiliateCustomers = [
  { rank: 1, customerName: 'Priya Sharma', phone: '+91 98765 43210', orders: 245, commissionEarned: 3675, joinedDate: '2024-10-15', status: 'active' },
  { rank: 2, customerName: 'Rajesh Kumar', phone: '+91 98765 43211', orders: 198, commissionEarned: 2376, joinedDate: '2024-11-02', status: 'active' },
  { rank: 3, customerName: 'Anita Patel', phone: '+91 98765 43212', orders: 176, commissionEarned: 3168, joinedDate: '2024-09-28', status: 'active' }, 
]; 

const topReferredCustomers = [
  { name: 'Rohit Gupta', referredBy: 'Priya Sharma', orders: 25, totalSpent: 3750 },
  { name: 'Sneha Joshi', referredBy: 'Rajesh Kumar', orders: 18, totalSpent: 2890 },
  { name: 'Arjun Nair', referredBy: 'Anita Patel', orders: 16, totalSpent: 2240 },
  { name: 'Kavya Menon', referredBy: 'Priya Sharma', orders: 14, totalSpent: 1960 }, 
];

const MetricCard = ({ title, value, change, icon: Icon, subtitle }:any) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-orange-50 rounded-xl">
        <Icon className="w-6 h-6 text-orange-500" />
      </div>
      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
        +{change}%
      </span>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
    </div>
  </div>
);

const AffiliateDashboard = () => {
  const [timeRange, setTimeRange] = useState('Last 7 Days');
  const [category, setCategory] = useState('All Categories');

  const getStatusColor = (status:any) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'low': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCustomerStatusColor = (status:any) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Affiliate Dashboard</h1>
              <p className="text-gray-500">Customer Referral Analytics</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
            </select>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option>All Categories</option>
              <option>Active Affiliates</option>
              <option>Inactive Affiliates</option>
              <option>Top Performers</option>
            </select>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="TOTAL COMMISSIONS"
            value="₹102,200"
            change="12.5"
            icon={IndianRupee}
            subtitle="Customer Referrals"
          />
          <MetricCard
            title="AFFILIATE CUSTOMERS"
            value="47"
            change="8.2"
            icon={Users}
            subtitle="Active Affiliates"
          />
          <MetricCard
            title="REFERRED CUSTOMERS"
            value="156"
            change="15.3"
            icon={User}
            subtitle="Total Referrals"
          />
          <MetricCard
            title="AVG COMMISSION"
            value="₹251.11"
            change="4.1"
            icon={Clock}
            subtitle="Per Customer"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Commission Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Commission Trend</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Commission']}
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#FF8C42" 
                  strokeWidth={3}
                  dot={{ fill: '#FF8C42', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Referrals */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Referrals by Category</h3>
            <div className="flex justify-center mb-6">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={categoryReferralData}
                    cx={100}
                    cy={100}
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {categoryReferralData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} referrals`]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {categoryReferralData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Affiliate Customers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Top Affiliate Customers</h3>
            </div>
            <div className="space-y-4">
              {topAffiliateCustomers.map((customer) => (
                <div key={customer.rank} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-orange-600">{customer.rank}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 truncate">{customer.customerName}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCustomerStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{customer.phone}</p>
                    <p className="text-xs text-gray-400">Joined: {new Date(customer.joinedDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{customer.orders} referral orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Commission</p>
                    <p className="font-bold text-orange-600">₹{customer.commissionEarned}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
 

          {/* Top Referred Customers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Top Referred Customers</h3>
            <div className="space-y-4">
              {topReferredCustomers.map((customer, index) => (
                <div key={index} className="flex items-start justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-xs text-gray-500">Referred by: {customer.referredBy}</p>
                      <p className="text-xs text-gray-400">{customer.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600">Total Spent</p>
                    <p className="font-bold text-gray-900">₹{customer.totalSpent}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;