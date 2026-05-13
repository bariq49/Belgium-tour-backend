import { Admin, IAdmin } from "../models/Admin";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { AppError } from "../errors/AppError";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

class AdminService {
  async getMe(adminId: string): Promise<IAdmin | null> {
    return Admin.findById(adminId);
  }

  async updateProfile(adminId: string, data: Partial<IAdmin>): Promise<IAdmin> {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    // Update only allowed fields
    const allowedUpdates = ["name", "firstName", "lastName", "phoneNumber", "avatar"];
    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (admin as any)[key] = (data as any)[key];
      }
    });

    await admin.save();
    return admin;
  }

  async changePassword(adminId: string, data: any): Promise<void> {
    const { currentPassword, newPassword } = data;
    const admin = await Admin.findById(adminId).select("+password");
    
    if (!admin) {
      throw new AppError("Admin not found", 404);
    }

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError("Incorrect current password", 400);
    }

    admin.password = newPassword;
    admin.passwordChangedAt = new Date();
    await admin.save();
  }

  async getDashboardOverview(months: number = 6) {
    const now = new Date();

    // Stats
    const totalRides = await Booking.countDocuments();
    const confirmedRides = await Booking.countDocuments({ status: "confirmed" });
    const upcomingRides = await Booking.countDocuments({ status: { $in: ["pending", "confirmed"] } });
    const cancelledRides = await Booking.countDocuments({ status: "cancelled" });

    // Revenue stats
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    const totalSpent = totalRevenue[0]?.total || 0;
    const averageRideValue = totalRides > 0 ? totalSpent / totalRides : 0;

    // Next Ride info
    const nextRide = await Booking.findOne({ 
      status: { $in: ["pending", "confirmed"] }
    }).sort({ date: 1, pickupTime: 1 });

    const lastRide = await Booking.findOne({
      status: "confirmed"
    }).sort({ date: -1, pickupTime: -1 });

    // Chart Data
    const labels: string[] = [];
    const spending: number[] = [];
    const bookings: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthLabel = format(date, "MMM");
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);

      labels.push(monthLabel);

      const monthlyBookings = await Booking.countDocuments({
        createdAt: { $gte: monthStart, $lte: monthEnd }
      });
      bookings.push(monthlyBookings);

      const monthlyRevenue = await Payment.aggregate([
        { $match: { 
          status: "completed",
          createdAt: { $gte: monthStart, $lte: monthEnd }
        }},
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);
      spending.push(monthlyRevenue[0]?.total || 0);
    }

    // Recent Bookings (Latest created)
    const recentBookingsList = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("tourId");

    const recentBookings = recentBookingsList.map(b => ({
      _id: b._id,
      orderNumber: b.orderNumber,
      customerName: b.customer.fullName,
      tourName: (b.tourId as any)?.title || b.tourName,
      amount: b.priceBreakdown?.totalPrice || 0,
      status: b.status,
      createdAt: b.createdAt
    }));

    // Next Rides List (Upcoming chronologically)
    const nextRidesList = await Booking.find({
      status: { $in: ["pending", "confirmed"] }
    })
    .sort({ date: 1, pickupTime: 1 })
    .limit(5)
    .populate("tourId");

    const nextRides = nextRidesList.map(b => ({
      _id: b._id,
      bookingNumber: b.orderNumber,
      pickupDate: b.date,
      pickupTime: b.pickupTime,
      amount: b.priceBreakdown?.totalPrice || 0,
      status: b.status
    }));

    return {
      stats: {
        totalRides,
        confirmedRides,
        upcomingRides,
        cancelledRides,
        totalSpent,
        averageRideValue,
        nextRideDate: nextRide?.date,
        lastRideDate: lastRide?.date
      },
      chart: {
        labels,
        spending,
        bookings
      },
      nextRides,
      recentBookings,
      security: {
        activeSessions: 1,
        status: "strong"
      }
    };
  }
}

export default new AdminService();
