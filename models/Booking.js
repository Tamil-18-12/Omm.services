const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    serviceType: { type: String, required: true }, // e.g., 'Catering', 'Travels', 'Photography'
    serviceName: { type: String, required: true }, // e.g., 'Banana Leaf', '54 Seater Bus'
    name: { type: String, required: true },
    age: { type: Number },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    date: { type: String, required: true },
    guests: { type: Number }, // For catering
    eventDuration: { type: String }, // For catering
    mealType: { type: String }, // For catering
    pickupLocation: { type: String }, // For travels
    dropDestination: { type: String }, // For travels
    travelDuration: { type: String }, // For travels
    passengerCount: { type: Number }, // For travels
    eventType: { type: String }, // For photography
    photographyDuration: { type: String }, // For photography
    sweetQuantity: { type: String }, // For sweets
    functionTime: { type: String }, // For sweets
    
    // NEW: Status tracking
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    
    // NEW: Status history
    statusHistory: [{
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: String,
        note: String
    }],
    
    // NEW: Additional metadata
    notes: { type: String }, // Admin notes
    totalAmount: { type: Number }, // Optional pricing
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
