import { randomUUID } from "crypto";
import { SquareClient, SquareEnvironment, WebhooksHelper } from "square";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

interface CreateCheckoutInput {
  bookingId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  customerName: string;
}

class SquareService {
  private client: SquareClient;

  constructor() {
    this.client = new SquareClient({
      token: env.SQUARE_ACCESS_TOKEN,
      environment:
        env.SQUARE_ENVIRONMENT === "production"
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    });
  }

  async createCheckoutSession(data: CreateCheckoutInput) {
    try {
      const response = await this.client.checkout.paymentLinks.create({
        idempotencyKey: randomUUID(),
        description: `Booking for Order #${data.orderNumber}`,
        quickPay: {
          name: `Tour Booking: ${data.orderNumber}`,
          priceMoney: {
            amount: BigInt(Math.round(data.amount * 100)),
            currency: "USD",
          },
          locationId: env.SQUARE_LOCATION_ID,
        },
        checkoutOptions: {
          redirectUrl: `${env.FRONTEND_URL}/booking/success?orderNumber=${data.orderNumber}`,
          merchantSupportEmail: env.EMAIL_FROM,
          askForShippingAddress: false,
          allowTipping: false,
          enableCoupon: false,
          enableLoyalty: false,
          acceptedPaymentMethods: {
            applePay: true,
            googlePay: true,
            cashAppPay: true,
            afterpayClearpay: false,
          },
        },
        prePopulatedData: {
          buyerEmail: data.customerEmail,
        },
        paymentNote: `bookingId:${data.bookingId};orderNumber:${data.orderNumber}`,
      });

      const link = response.paymentLink;
      if (!link?.url || !link.id) {
        throw new AppError("Square did not return a valid payment link", 502);
      }

      return {
        id: link.id,
        url: link.url,
        orderId: link.orderId,
      };
    } catch (error: any) {
      const message = error?.errors?.[0]?.detail || error?.message || "Square checkout failed";
      throw new AppError(`Square checkout creation failed: ${message}`, 500);
    }
  }

  async verifyWebhook(rawBody: string, signature: string): Promise<boolean> {
    if (!signature) return false;
    return WebhooksHelper.verifySignature({
      requestBody: rawBody,
      signatureHeader: signature,
      signatureKey: env.SQUARE_WEBHOOK_SIGNATURE_KEY,
      notificationUrl: env.SQUARE_WEBHOOK_NOTIFICATION_URL,
    });
  }

  async getPayment(paymentId: string) {
    const response = await this.client.payments.get({ paymentId });
    return response.payment;
  }
}

export default new SquareService();
