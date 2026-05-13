import Stripe = require("stripe");
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

interface CreateCheckoutInput {
  bookingId: string;
  orderNumber: string;
  amount: number;
  customerEmail: string;
  customerName: string;
}

class StripeService {
  private stripe: Stripe.Stripe;

  constructor() {
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }

  async createCheckoutSession(data: CreateCheckoutInput) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Tour Booking: ${data.orderNumber}`,
                description: `Booking for Order #${data.orderNumber}`,
              },
              unit_amount: Math.round(data.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${env.FRONTEND_URL}/booking/success?orderNumber=${data.orderNumber}`,
        cancel_url: `${env.FRONTEND_URL}/booking/cancel?orderNumber=${data.orderNumber}`,
        customer_email: data.customerEmail,
        client_reference_id: data.bookingId,
        metadata: {
          bookingId: data.bookingId,
          orderNumber: data.orderNumber,
        },
      });

      if (!session.url) {
        throw new AppError("Stripe did not return a valid checkout URL", 502);
      }

      return {
        id: session.id,
        url: session.url,
      };
    } catch (error: any) {
      throw new AppError(`Stripe checkout creation failed: ${error.message}`, 500);
    }
  }

  async constructEvent(rawBody: string, signature: string) {
    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error: any) {
      throw new AppError(`Stripe Webhook Error: ${error.message}`, 400);
    }
  }

  async getPaymentIntent(id: string) {
    return await this.stripe.paymentIntents.retrieve(id);
  }

  async getLatestCharge(paymentIntentId: string) {
    const charges = await this.stripe.charges.list({
      payment_intent: paymentIntentId,
      limit: 1,
    });
    return charges.data[0];
  }
}

export default new StripeService();
