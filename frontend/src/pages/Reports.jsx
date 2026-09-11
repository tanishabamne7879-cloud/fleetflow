// frontend/src/pages/Reports.jsx - Export working

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
    FaFileAlt, FaChartBar, FaChartLine, FaDownload,
    FaTruck, FaUser, FaBox, FaGasPump,
    FaArrowRight, FaCalendarAlt, FaSpinner
} from 'react-icons/fa';

const Reports = () => {
    const { user } = useAuth();
    const [selectedReport, setSelectedReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);

    const reportTypes = [
        { id: 'vehicle-utilization', icon: FaTruck, label: 'Vehicle Utilization', desc: 'Analyze vehicle usage and efficiency', endpoint: '/reports/vehicle-utilization' },
        { id: 'driver-performance', icon: FaUser, label: 'Driver Performance', desc: 'Track driver performance and productivity', endpoint: '/reports/driver-performance' },
        { id: 'shipment-analysis', icon: FaBox, label: 'Shipment Analysis', desc: 'Analyze shipment trends and patterns', endpoint: '/reports/shipment-analysis' },
        { id: 'fuel-consumption', icon: FaGasPump, label: 'Fuel Consumption', desc: 'Monitor fuel usage and costs', endpoint: '/reports/fuel-consumption' },
    ];

    const generateReport = async (reportId, endpoint) => {
        setLoading(true);
        setSelectedReport(reportId);
        try {
            const response = await api.get(endpoint);
            setReportData(response.data);
            toast.success('Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    const exportReport = () => {
        if (!reportData) {
            toast.error('No report data to export');
            return;
        }
        
        try {
            // Convert to CSV
            const dataStr = JSON.stringify(reportData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedReport}-report-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report exported successfully!');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics Center</h1>
                <p className="text-sm text-gray-500">Generate and analyze reports for your fleet operations</p>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {reportTypes.map((report) => {
                    const Icon = report.icon;
                    return (
                        <div
                            key={report.id}
                            onClick={() => generateReport(report.id, report.endpoint)}
                            className={`bg-white rounded-xl shadow-sm p-5 cursor-pointer transition hover:shadow-md ${
                                selectedReport === report.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    selectedReport === report.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    <Icon className="text-xl" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{report.label}</h3>
                                    <p className="text-xs text-gray-500 mt-1">{report.desc}</p>
                                    {loading && selectedReport === report.id ? (
                                        <div className="mt-2 flex items-center space-x-2 text-sm text-blue-600">
                                            <FaSpinner className="animate-spin" />
                                            <span>Generating...</span>
                                        </div>
                                    ) : (
                                        <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center">
                                            Generate Report
                                            <FaArrowRight className="ml-1 text-xs" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Preview & Export */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                        <FaFileAlt className="text-blue-600 mr-2" />
                        {reportData ? 'Report Preview' : 'Generating report preview...'}
                    </h3>
                    {/* ✅ EXPORT BUTTON - Working */}
                    <button 
                        onClick={exportReport}
                        disabled={!reportData}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition ${
                            reportData 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <FaDownload className="text-sm" />
                        <span>Export</span>
                    </button>
                </div>
                <div className="h-48 bg-gray-50 rounded-lg overflow-auto p-4">
                    {reportData ? (
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(reportData, null, 2)}
                        </pre>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                            Select a report to preview
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-sm text-gray-500 border-t border-gray-200 pt-4">
                <div className="flex space-x-4">
                    <span className="font-medium text-gray-700">Sprint</span>
                    <span className="text-blue-600">Home</span>
                    <span>Reports</span>
                    <span>Analytics</span>
                    <span>Dashboard</span>
                    <span>Settings</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span>Springboard</span>
                    <span>4 others</span>
                </div>
            </div>
        </div>
    );
};

export default Reports;