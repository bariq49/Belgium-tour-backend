import mongoose from "mongoose";
import { CustomTourRequest } from "../models/CustomTourRequest";
import { Tour } from "../models/Tour";
import APIFeature from "../utils/APIFeature";
import emailService from "./email.service";
import logger from "../utils/logger";
import type { CreateCustomTourRequestInput, UpdateCustomTourRequestInput } from "../types/custom-tour-request.types";

class CustomTourRequestService {
  async createRequest(body: CreateCustomTourRequestInput) {
    const request = await CustomTourRequest.create({
      tourId: body.tourId,
      date: new Date(body.date),
      durationNights: body.durationNights,
      adultsCount: body.adultsCount,
      adultAges: body.adultAges || [],
      specialRequests: body.specialRequests || "",
      budgetPerPerson: body.budgetPerPerson,
      budgetFlexibility: body.budgetFlexibility,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
    });

    // Send emails asynchronously
    const tour = await Tour.findById(body.tourId).select("title").lean();
    const tourTitle = tour?.title || "Custom Private Tour";

    await emailService.sendCustomTourRequestEmails(request, tourTitle)
      .catch(err => logger.error("Failed to send custom tour request emails:", err));

    return request;
  }

  async getAllRequests(queryString: Record<string, any>) {
    const features = new APIFeature(CustomTourRequest as any, queryString, {
      search: { searchFields: ["firstName", "lastName", "email", "phone"] },
      filterFields: ["status", "tourId"],
      sort: { defaultSort: "-createdAt" },
      populate: { path: "tourId", select: "title coverImage" },
    });

    const result = await features.execute();

    return {
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    };
  }

  async getRequestById(idOrNumber: string) {
    const isId = mongoose.isValidObjectId(idOrNumber);
    const query = isId ? { _id: idOrNumber } : { requestNumber: idOrNumber };

    return await CustomTourRequest.findOne(query)
      .populate("tourId", "title coverImage")
      .exec();
  }

  async updateRequest(id: string, body: UpdateCustomTourRequestInput) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await CustomTourRequest.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("tourId", "title coverImage").exec();
  }

  async deleteRequest(id: string) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await CustomTourRequest.findByIdAndDelete(id);
  }

  async bulkDeleteRequests(ids: string[]) {
    await CustomTourRequest.deleteMany({ _id: { $in: ids } });
  }
}

export default new CustomTourRequestService();
