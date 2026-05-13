import { BookingSettings, IBookingSettings } from "../models/BookingSettings";

class BookingSettingsService {
  async getSettings(): Promise<IBookingSettings> {
    let settings = await BookingSettings.findOne();

    if (!settings) {
      settings = await BookingSettings.create({
        prepaidFuel: 0,
        deliveryPickup: 0,
        tripProtection: 0,
        cardFee: 0,
        tax: 0,
      });
    }

    return settings;
  }
  async updateSettings(data: Partial<IBookingSettings>): Promise<IBookingSettings> {
    const existingSettings = await BookingSettings.findOne();

    if (!existingSettings) {
      return await BookingSettings.create(data);
    }

    const updatedSettings = await BookingSettings.findByIdAndUpdate(
      existingSettings._id,
      { $set: data },
      { new: true }
    );

    if (!updatedSettings) {
      throw new Error("Booking settings not found");
    }

    return updatedSettings;
  }
}

export default new BookingSettingsService();
