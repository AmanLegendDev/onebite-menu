import { connectDB } from "@/lib/db";
import Order from "@/models/Orders";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  await connectDB();

  const { id } = params;

  return new Response(
    new ReadableStream({
      async start(controller) {
        const send = (data) => {
          controller.enqueue(
            `data: ${JSON.stringify(data)}\n\n`
          );
        };

        // initial emit
        const order = await Order.findById(id).lean();
        send({ order });

        // Mongo change stream
        const stream = Order.watch([
          { $match: { "fullDocument._id": order._id } }
        ]);

        stream.on("change", async () => {
          const updated = await Order.findById(id).lean();
          send({ order: updated });
        });

        stream.on("error", (err) => {
          console.log("SSE Error:", err);
        });
      }
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      }
    }
  );
}
