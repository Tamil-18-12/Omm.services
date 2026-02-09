const XLSX = require('xlsx');
const Booking = require('../models/Booking');

// Export bookings to Excel
exports.exportToExcel = async (req, res) => {
    try {
        const { serviceType, status, startDate, endDate } = req.query;

        // Build filter
        const filter = {};
        if (serviceType) filter.serviceType = serviceType;
        if (status) filter.status = status;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Fetch bookings
        const bookings = await Booking.find(filter).sort({ createdAt: -1 });

        // Prepare data for Excel
        const excelData = bookings.map(booking => {
            const baseData = {
                'Booking ID': booking._id.toString().slice(-8).toUpperCase(),
                'Service Type': booking.serviceType,
                'Service Name': booking.serviceName,
                'Customer Name': booking.name,
                'Age': booking.age || 'N/A',
                'Phone': booking.phone,
                'Email': booking.email || 'N/A',
                'Address': booking.address || 'N/A',
                'Event Date': booking.date,
                'Status': booking.status,
                'Booking Date': new Date(booking.createdAt).toLocaleDateString(),
                'Total Amount': booking.totalAmount || 'N/A',
                'Notes': booking.notes || 'N/A'
            };

            // Add service-specific fields
            if (booking.serviceType === 'Catering') {
                baseData['Meal Type'] = booking.mealType || 'N/A';
                baseData['Guests'] = booking.guests || 'N/A';
                baseData['Event Duration'] = booking.eventDuration || 'N/A';
            } else if (booking.serviceType === 'Travels') {
                baseData['Pickup Location'] = booking.pickupLocation || 'N/A';
                baseData['Drop Destination'] = booking.dropDestination || 'N/A';
                baseData['Travel Duration'] = booking.travelDuration || 'N/A';
                baseData['Passengers'] = booking.passengerCount || 'N/A';
            } else if (booking.serviceType === 'Photography') {
                baseData['Event Type'] = booking.eventType || 'N/A';
                baseData['Photography Duration'] = booking.photographyDuration || 'N/A';
            } else if (booking.serviceType === 'Sweet Stall') {
                baseData['Sweet Quantity'] = booking.sweetQuantity || 'N/A';
                baseData['Function Time'] = booking.functionTime || 'N/A';
            }

            return baseData;
        });

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
            { wch: 12 }, // Booking ID
            { wch: 15 }, // Service Type
            { wch: 20 }, // Service Name
            { wch: 20 }, // Customer Name
            { wch: 8 },  // Age
            { wch: 15 }, // Phone
            { wch: 25 }, // Email
            { wch: 30 }, // Address
            { wch: 12 }, // Event Date
            { wch: 12 }, // Status
            { wch: 12 }, // Booking Date
            { wch: 12 }, // Total Amount
            { wch: 30 }  // Notes
        ];
        ws['!cols'] = colWidths;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

        // Generate buffer
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Set response headers
        const filename = `OM_Service_Bookings_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send file
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export to Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export bookings',
            error: error.message
        });
    }
};

// Export statistics to Excel
exports.exportStatistics = async (req, res) => {
    try {
        // Get statistics
        const serviceStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$serviceType',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        const statusStats = await Booking.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyStats = await Booking.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' }
                }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
        ]);

        // Create workbook
        const wb = XLSX.utils.book_new();

        // Service Statistics Sheet
        const serviceData = serviceStats.map(s => ({
            'Service Type': s._id,
            'Total Bookings': s.count,
            'Total Amount': s.totalAmount || 0
        }));
        const ws1 = XLSX.utils.json_to_sheet(serviceData);
        XLSX.utils.book_append_sheet(wb, ws1, 'By Service');

        // Status Statistics Sheet
        const statusData = statusStats.map(s => ({
            'Status': s._id,
            'Count': s.count
        }));
        const ws2 = XLSX.utils.json_to_sheet(statusData);
        XLSX.utils.book_append_sheet(wb, ws2, 'By Status');

        // Monthly Statistics Sheet
        const monthlyData = monthlyStats.map(s => ({
            'Year': s._id.year,
            'Month': s._id.month,
            'Bookings': s.count,
            'Total Amount': s.totalAmount || 0
        }));
        const ws3 = XLSX.utils.json_to_sheet(monthlyData);
        XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Trends');

        // Generate buffer
        const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        // Set response headers
        const filename = `OM_Service_Statistics_${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send file
        res.send(excelBuffer);
    } catch (error) {
        console.error('Export statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export statistics',
            error: error.message
        });
    }
};
