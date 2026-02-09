const Booking = require('../models/Booking');
const { sendBookingConfirmation, sendAdminNotification } = require('../utils/emailService');

// Create Booking
exports.createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        
        // Create new booking with default status
        const booking = new Booking({
            ...bookingData,
            status: 'Pending',
            statusHistory: [{
                status: 'Pending',
                changedAt: new Date(),
                note: 'Booking created'
            }]
        });

        await booking.save();

        // Send confirmation emails
        try {
            if (booking.email) {
                await sendBookingConfirmation(booking);
            }
            await sendAdminNotification(booking);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail the booking if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create booking',
            error: error.message
        });
    }
};

// Get All Bookings with Filters and Pagination
exports.getAllBookings = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            serviceType, 
            status, 
            search,
            startDate,
            endDate 
        } = req.query;

        // Build filter query
        const filter = {};
        
        if (serviceType) {
            filter.serviceType = serviceType;
        }
        
        if (status) {
            filter.status = status;
        }
        
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get bookings with pagination
        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Booking.countDocuments(filter);

        res.json({
            success: true,
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};

// Get Single Booking
exports.getBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
};

// Update Booking
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Track status change
        if (updateData.status && updateData.status !== booking.status) {
            booking.statusHistory.push({
                status: updateData.status,
                changedAt: new Date(),
                changedBy: req.adminId || 'admin',
                note: updateData.statusNote || `Status changed to ${updateData.status}`
            });
        }

        // Update fields
        Object.keys(updateData).forEach(key => {
            if (key !== 'statusNote') {
                booking[key] = updateData[key];
            }
        });

        booking.updatedAt = new Date();
        await booking.save();

        res.json({
            success: true,
            message: 'Booking updated successfully',
            booking
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
            error: error.message
        });
    }
};

// Delete Booking
exports.deleteBooking = async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        res.json({
            success: true,
            message: 'Booking deleted successfully'
        });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete booking',
            error: error.message
        });
    }
};

// Get Booking Statistics
exports.getStatistics = async (req, res) => {
    try {
        const stats = await Booking.aggregate([
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

        const totalBookings = await Booking.countDocuments();

        res.json({
            success: true,
            statistics: {
                total: totalBookings,
                byService: stats,
                byStatus: statusStats
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
};
// Get User's Bookings (by Email)
exports.getUserBookings = async (req, res) => {
    try {
        // Fetch user to get email
        const User = require('../models/User');
        const user = await User.findById(req.userId || req.adminId); // Handle both for safety
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const bookings = await Booking.find({ email: user.email }).sort({ createdAt: -1 });

        res.json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
};
